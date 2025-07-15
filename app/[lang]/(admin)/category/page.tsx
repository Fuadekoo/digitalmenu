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

interface CategoryItem {
  id: string | number;
  key?: string | number;
  cname: string;
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

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
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
        refreshCategories();
      } else {
        addToast({
          title: "Error",
          description: response || "Failed to update category.",
        });
      }
    },
  ]);

  const handleDeleteCategory = async (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      await executeDeleteCategory(id.toString());
    }
  };

  const handleEditCategory = (item: CategoryItem) => {
    setEditCategory(item);
    setShowModal(true);
    setValue("cname", item.cname);
  };

  const handleAddCategory = () => {
    setEditCategory(null);
    reset();
    setShowModal(true);
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
    <div>
      <div className="overflow-y-auto mb-4 flex items-center justify-end">
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
        <div className="fixed inset-0 backdrop-blur-sm  bg-opacity-50 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
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
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="ghost"
                  type="button"
                  onPress={() => {
                    setShowModal(false);
                    setEditCategory(null);
                    reset();
                  }}
                  disabled={isLoadingCreate || isLoadingUpdate}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  isLoading={editCategory ? isLoadingUpdate : isLoadingCreate}
                  disabled={editCategory ? isLoadingUpdate : isLoadingCreate}
                >
                  {(editCategory ? isLoadingUpdate : isLoadingCreate) ? (
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
