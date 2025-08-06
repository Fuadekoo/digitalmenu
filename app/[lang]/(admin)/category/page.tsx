"use client";
import React, { useState } from "react";
import useAction from "@/hooks/useActions";
import {
  getCategory,
  deleteCategory,
  createCategory,
  updateCategory,
} from "@/actions/admin/category";
import CustomTable from "@/components/custom-table";
import { Button } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { z } from "zod";
import { categorySchema } from "@/lib/zodSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface CategoryItem {
  id: string | number;
  key?: string | number;
  cname: string;
  photo?: string;
  createdAt?: string;
}

interface ColumnDef {
  key: string;
  label: string;
  renderCell?: (item: Record<string, string>) => React.ReactNode;
}

function CategoryList() {
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState<CategoryItem | null>(null);
  const [photoValue, setPhotoValue] = useState<string | null>(null);
  const [isConvertingImage, setIsConvertingImage] = useState(false);

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    mode: "onChange",
  });

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [categoryData, refreshCategories, isLoadingCategories] = useAction(
    getCategory,
    [true, () => {}],
    search,
    page,
    pageSize
  );

  const [, executeDeleteCategory, isLoadingDelete] = useAction(deleteCategory, [
    ,
    (response) => {
      if (response) {
        addToast({
          title: "Success",
          description: response?.message || "Category deleted.",
        });
        refreshCategories();
      } else {
        addToast({
          title: "Error",
          description: response || "Failed to delete category.",
        });
      }
    },
  ]);

  const [, categoryAction, isLoadingCreate] = useAction(createCategory, [
    ,
    (response) => {
      if (response) {
        addToast({
          title: "Success",
          description: response?.message || "Category created.",
        });
        setShowModal(false);
        reset();
        setPhotoValue(null);
        refreshCategories();
      } else {
        addToast({
          title: "Error",
          description: response || "Failed to create category.",
        });
      }
    },
  ]);

  const [, updateCategoryAction, isLoadingUpdate] = useAction(updateCategory, [
    ,
    (response) => {
      if (response) {
        addToast({
          title: "Success",
          description: response?.message || "Category updated.",
        });
        setShowModal(false);
        setEditCategory(null);
        reset();
        setPhotoValue(null);
        refreshCategories();
      } else {
        addToast({
          title: "Error",
          description: response || "Failed to update category.",
        });
      }
    },
  ]);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsConvertingImage(true);
      setValue("photo", "", { shouldValidate: false }); // Clear previous photo immediately

      try {
        const fileBuffer = await file.arrayBuffer();
        const base64String = Buffer.from(fileBuffer).toString("base64");
        // The backend expects a raw base64 string.
        // If it expected a data URL, you'd prepend `data:${file.type};base64,`
        setValue("photo", base64String, { shouldValidate: true });
      } catch (error) {
        console.error("Error converting file to base64:", error);
        addToast({
          title: "Image Error",
          description: "Could not process the file.",
        });
        setValue("photo", "", { shouldValidate: true }); // Clear on error
      } finally {
        setIsConvertingImage(false);
      }
    } else {
      setValue("photo", "", { shouldValidate: true }); // Clear if no file selected
    }
  };

  const handleDeleteCategory = async (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      await executeDeleteCategory(id.toString());
    }
  };

  const handleEditCategory = (item: CategoryItem) => {
    setEditCategory(item);
    setShowModal(true);
    setValue("cname", item.cname);
    setValue("photo", item.photo || "");
    setPhotoValue(item.photo || null);
  };

  const handleAddCategory = () => {
    setEditCategory(null);
    reset();
    setShowModal(true);
    setPhotoValue(null);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsConvertingImage(true);
      setValue("photo", "", { shouldValidate: false });
      setPhotoValue(null);

      try {
        const fileBuffer = await file.arrayBuffer();
        const base64String = Buffer.from(fileBuffer).toString("base64");
        setValue("photo", base64String, { shouldValidate: true });
        setPhotoValue(`data:image/jpeg;base64,${base64String}`);
      } catch {
        addToast({
          title: "Image Error",
          description: "Could not process the file.",
        });
        setValue("photo", "", { shouldValidate: true });
        setPhotoValue(null);
      } finally {
        setIsConvertingImage(false);
      }
    } else {
      setValue("photo", "", { shouldValidate: true });
      setPhotoValue(null);
    }
  };

  const onSubmit = async (data: z.infer<typeof categorySchema>) => {
    if (editCategory) {
      updateCategoryAction(editCategory.id.toString(), data);
    } else {
      categoryAction(data);
    }
  };

  const rows = (categoryData?.data || []).map((category) => ({
    ...Object.fromEntries(
      Object.entries(category).map(([k, v]) => [
        k,
        v === undefined || v === null ? "" : v.toString(),
      ])
    ),
    key: category.id?.toString(),
    id: category.id?.toString(),
  }));

  const columns: ColumnDef[] = [
    {
      key: "autoId",
      label: "#",
      renderCell: (item) => {
        const rowIndexOnPage = rows.findIndex((r) => r.id === item.id);
        if (rowIndexOnPage !== -1) {
          return (page - 1) * pageSize + rowIndexOnPage + 1;
        }
        return item.id?.toString().slice(0, 5) + "...";
      },
    },
    {
      key: "cname",
      label: "Category Name",
      renderCell: (item) => item.cname,
    },
    { key: "photo", label: "Proof" },
    {
      key: "createdAt",
      label: "Created At",
      renderCell: (item) =>
        item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A",
    },
    {
      key: "actions",
      label: "Actions",
      renderCell: (item) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            color="primary"
            variant="flat"
            onPress={() =>
              handleEditCategory({
                id: item.id,
                cname: item.cname,
                photo: item.photo,
                createdAt: item.createdAt,
              })
            }
            disabled={isLoadingDelete}
          >
            Edit
          </Button>
          <Button
            size="sm"
            color="danger"
            variant="flat"
            onPress={() => handleDeleteCategory(item.id)}
            disabled={isLoadingDelete}
          >
            {isLoadingDelete ? "Deleting..." : "Delete"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="overflow-hidden ">
      <div className=" overflow-y-auto mb-4 flex items-center justify-end">
        <Button color="primary" onPress={handleAddCategory}>
          Add Category
        </Button>
      </div>
      <CustomTable
        columns={columns}
        rows={rows}
        totalRows={categoryData?.pagination.totalRecords || 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        searchValue={search}
        onSearch={setSearch}
        isLoading={isLoadingCategories}
      />
      {/* Custom Modal for Add/Edit Category */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm  bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md h-auto max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editCategory ? "Edit Category" : "Add Category"}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-4">
                <input
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Category Name"
                  {...register("cname")}
                  disabled={isLoadingCreate || isLoadingUpdate}
                />
                {errors.cname && (
                  <span className="text-red-500 text-xs">
                    {errors.cname.message}
                  </span>
                )}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Upload Category Image
                  </label>
                  <input
                    type="file"
                    {...register("photo", { onChange: handleFileChange })}
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    disabled={isConvertingImage}
                  />
                  {isConvertingImage && (
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      Processing image...
                    </div>
                  )}
                  {errors.photo && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.photo.message as string}
                    </p>
                  )}
                </div>
                {photoValue &&
                  typeof photoValue === "string" &&
                  !isConvertingImage && (
                    <div className="mt-2 border rounded-md p-2">
                      <span className="text-xs text-gray-500 block text-center mb-1">
                        Preview
                      </span>
                      <Image
                        src={photoValue}
                        alt="Category preview"
                        className="max-h-40 rounded mx-auto"
                        width={160}
                        height={160}
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                  )}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="ghost"
                  type="button"
                  onPress={() => {
                    setShowModal(false);
                    setEditCategory(null);
                    reset();
                    setPhotoValue(null);
                  }}
                  disabled={isLoadingCreate || isLoadingUpdate}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  isLoading={editCategory ? isLoadingUpdate : isLoadingCreate}
                  disabled={
                    editCategory
                      ? isLoadingUpdate
                      : isLoadingCreate || isConvertingImage
                  }
                >
                  {(editCategory ? isLoadingUpdate : isLoadingCreate) ||
                  isConvertingImage ? (
                    <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                  ) : null}
                  {editCategory ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryList;
