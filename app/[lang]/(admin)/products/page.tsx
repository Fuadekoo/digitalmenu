"use client";
import React, { useState } from "react";
import useAction from "@/hooks/useActions";
import {
  getProducts,
  deleteProduct,
  createProduct,
  updateProduct,
} from "@/actions/admin/product";
import { getCategory } from "@/actions/admin/category";
import CustomTable from "@/components/custom-table";
import { Button } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { z } from "zod";
import { productSchema } from "@/lib/zodSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { RadioGroup, Radio } from "@heroui/react";
import { Input } from "@heroui/input"; // Import Input component
import Image from "next/image";

interface ProductItem {
  id: string | number;
  key?: string | number;
  name: string;
  description: string;
  photo: string;
  price: number;
  discount?: number; // Optional discount field
  quantity: number;
  isAvailable: boolean;
  isFeatured: boolean;
  categoryId: string;
  createdAt?: string;
}

interface CategoryItem {
  id: string | number;
  cname: string;
}

interface ColumnDef {
  key: string;
  label: string;
  renderCell?: (item: Record<string, string>) => React.ReactNode;
}

function Page() {
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductItem | null>(null);
  const [photoValue, setPhotoValue] = useState<string | null>(null); // Base64 or URL
  const [isConvertingImage, setIsConvertingImage] = useState(false); // Loading state

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors, isValid }, // Added isValid
  } = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    mode: "onChange", // Validate on change
  });

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [productData, refreshProducts, isLoadingProducts] = useAction(
    getProducts,
    [true, () => {}],
    search,
    page,
    pageSize
  );

  const [categoryData, , isLoadingCategories] = useAction(getCategory, [
    true,
    () => {},
  ]);

  const [, executeDeleteProduct, isLoadingDelete] = useAction(deleteProduct, [
    ,
    (response) => {
      if (response) {
        addToast({
          title: "Success",
          description: response?.message || "Product deleted.",
        });
        refreshProducts();
      } else {
        addToast({
          title: "Error",
          description: response || "Failed to delete product.",
        });
      }
    },
  ]);

  const [, productAction, isLoadingCreate] = useAction(createProduct, [
    ,
    (response) => {
      if (response) {
        addToast({
          title: "Success",
          description: response?.message || "Product created.",
        });
        setShowModal(false);
        reset();
        refreshProducts();
        setPhotoValue(null); // Clear preview
      } else {
        addToast({
          title: "Error",
          description: response || "Failed to create product.",
        });
      }
    },
  ]);

  const [, updateProductAction, isLoadingUpdate] = useAction(updateProduct, [
    ,
    (response) => {
      if (response) {
        addToast({
          title: "Success",
          description: response?.message || "Product updated.",
        });
        setShowModal(false);
        setEditProduct(null);
        reset();
        refreshProducts();
        setPhotoValue(null); // Clear preview
      } else {
        addToast({
          title: "Error",
          description: response || "Failed to update product.",
        });
      }
    },
  ]);

  const handleDeleteProduct = async (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await executeDeleteProduct(id.toString());
    }
  };

  const handleEditProduct = (item: ProductItem) => {
    setEditProduct(item);
    setShowModal(true);
    setValue("name", item.name);
    setValue("description", item.description);
    setValue("photo", item.photo); // Set existing photo URL or base64
    setValue("price", item.price);
    setValue("discount", item.discount || 0); // Set discount, default to 0 if not provided
    setValue("quantity", item.quantity);
    setValue("isAvailable", item.isAvailable);
    setValue("isFeatured", item.isFeatured);
    setValue("categoryId", item.categoryId);
    setPhotoValue(item.photo); // Set preview to existing URL or base64
  };

  const handleAddProduct = () => {
    setEditProduct(null);
    reset();
    setShowModal(true);
    setPhotoValue(null); // Clear preview
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsConvertingImage(true);
      setValue("photo", "", { shouldValidate: false }); // Clear previous photo immediately
      setPhotoValue(null); // Clear preview

      try {
        const fileBuffer = await file.arrayBuffer();
        const base64String = Buffer.from(fileBuffer).toString("base64");
        // The backend expects a raw base64 string.
        // If it expected a data URL, you'd prepend `data:${file.type};base64,`
        setValue("photo", base64String, { shouldValidate: true });
        setPhotoValue(`data:image/jpeg;base64,${base64String}`); // Set preview
      } catch (error) {
        console.error("Error converting file to base64:", error);
        addToast({
          title: "Image Error",
          description: "Could not process the file.",
        });
        setValue("photo", "", { shouldValidate: true }); // Clear on error
        setPhotoValue(null); // Clear preview
      } finally {
        setIsConvertingImage(false);
      }
    } else {
      setValue("photo", "", { shouldValidate: true }); // Clear if no file selected
      setPhotoValue(null); // Clear preview
    }
  };

  const onSubmit = async (data: z.infer<typeof productSchema>) => {
    if (editProduct) {
      updateProductAction(editProduct.id.toString(), data);
    } else {
      productAction(data);
    }
  };

  const rows = (productData?.data || []).map((product) => ({
    ...Object.fromEntries(
      Object.entries(product).map(([k, v]) => [
        k,
        v === undefined || v === null ? "" : v.toString(),
      ])
    ),
    key: product.id?.toString(),
    id: product.id?.toString(),
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
      key: "name",
      label: "Name",
      renderCell: (item) => item.name,
    },
    {
      key: "description",
      label: "Description",
      renderCell: (item) => item.description,
    },
    { key: "photo", label: "Proof" },
    {
      key: "price",
      label: "Price",
      renderCell: (item) => <span>${item.price}</span>,
    },
    {
      key: "quantity",
      label: "Quantity",
      renderCell: (item) => item.quantity,
    },
    {
      key: "isAvailable",
      label: "Available",
      renderCell: (item) =>
        item.isAvailable ? (
          <span className="text-green-600 font-semibold">Yes</span>
        ) : (
          <span className="text-red-600 font-semibold">No</span>
        ),
    },
    {
      key: "isFeatured",
      label: "Featured",
      renderCell: (item) =>
        item.isFeatured ? (
          <span className="text-yellow-600 font-semibold">Yes</span>
        ) : (
          <span className="text-gray-400 font-semibold">No</span>
        ),
    },
    {
      key: "categoryId",
      label: "Category",
      renderCell: (item) => {
        const cat = categoryData?.data?.find(
          (c: CategoryItem) => c.id === item.categoryId
        );
        return cat ? cat.cname : item.categoryId;
      },
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
              handleEditProduct({
                id: item.id,
                name: item.name,
                description: item.description,
                photo: item.photo,
                price: Number(item.price),
                quantity: Number(item.quantity),
                isAvailable: String(item.isAvailable) === "true",
                isFeatured: String(item.isFeatured) === "true",
                categoryId: item.categoryId,
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
            onPress={() => handleDeleteProduct(item.id)}
            disabled={isLoadingDelete}
          >
            {isLoadingDelete ? "Deleting..." : "Delete"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="overflow-hidden">
      <div className="overflow-y-auto mb-4 flex items-center justify-end">
        <Button color="primary" onPress={handleAddProduct}>
          Add Product
        </Button>
      </div>
      <CustomTable
        columns={columns}
        rows={rows}
        totalRows={productData?.pagination?.totalRecords || 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        searchValue={search}
        onSearch={setSearch}
        isLoading={isLoadingProducts}
      />
      {/* Custom Modal for Add/Edit Product */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex justify-center items-center p-4 z-50 overflow-">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md h-auto max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editProduct ? "Edit Product" : "Add Product"}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-4">
                <Input
                  placeholder="Name"
                  {...register("name")}
                  disabled={isLoadingCreate || isLoadingUpdate}
                />
                {errors.name && (
                  <span className="text-red-500 text-xs">
                    {errors.name.message}
                  </span>
                )}
                <textarea
                  placeholder="Description"
                  {...register("description")}
                  disabled={isLoadingCreate || isLoadingUpdate}
                />
                {errors.description && (
                  <span className="text-red-500 text-xs">
                    {errors.description.message}
                  </span>
                )}

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Upload Product Image
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    {...register("photo", { onChange: handleImageChange })}
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
                        alt="Product preview"
                        className="max-h-40 rounded mx-auto"
                        width={160}
                        height={160}
                        style={{ objectFit: "contain" }}
                        unoptimized
                      />
                    </div>
                  )}

                <Input
                  placeholder="Price"
                  type="number"
                  step="0.01"
                  {...register("price", { valueAsNumber: true })}
                  disabled={isLoadingCreate || isLoadingUpdate}
                />
                {errors.price && (
                  <span className="text-red-500 text-xs">
                    {errors.price.message}
                  </span>
                )}

                <Input
                  placeholder="Discount"
                  type="number"
                  step="0.01"
                  {...register("discount", { valueAsNumber: true })}
                  disabled={isLoadingCreate || isLoadingUpdate}
                />
                {errors.discount && (
                  <span className="text-red-500 text-xs">
                    {errors.discount.message}
                  </span>
                )}
                <Input
                  placeholder="Quantity"
                  type="number"
                  {...register("quantity", { valueAsNumber: true })}
                  disabled={isLoadingCreate || isLoadingUpdate}
                />
                {errors.quantity && (
                  <span className="text-red-500 text-xs">
                    {errors.quantity.message}
                  </span>
                )}
                <RadioGroup
                  label="Select product status"
                  orientation="horizontal"
                  value={
                    watch("isAvailable")
                      ? "available"
                      : watch("isFeatured")
                      ? "featured"
                      : ""
                  }
                  onValueChange={(val) => {
                    setValue("isAvailable", val === "available", {
                      shouldValidate: true,
                    });
                    setValue("isFeatured", val === "featured", {
                      shouldValidate: true,
                    });
                  }}
                  // disabled={isLoadingCreate || isLoadingUpdate}
                >
                  <Radio value="available">Available</Radio>
                  <Radio value="featured">Featured</Radio>
                </RadioGroup>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  {...register("categoryId")}
                  disabled={
                    isLoadingCreate || isLoadingUpdate || isLoadingCategories
                  }
                  defaultValue={watch("categoryId") || ""}
                >
                  <option value="">Select Category</option>
                  {categoryData?.data?.map((cat: CategoryItem) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.cname}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <span className="text-red-500 text-xs">
                    {errors.categoryId.message}
                  </span>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="ghost"
                  type="button"
                  onPress={() => {
                    setShowModal(false);
                    setEditProduct(null);
                    reset();
                    setPhotoValue(null); // Clear preview
                  }}
                  disabled={isLoadingCreate || isLoadingUpdate}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  isLoading={editProduct ? isLoadingUpdate : isLoadingCreate}
                  disabled={
                    !isValid ||
                    (editProduct ? isLoadingUpdate : isLoadingCreate) ||
                    isConvertingImage
                  }
                >
                  {(editProduct ? isLoadingUpdate : isLoadingCreate) ||
                  isConvertingImage ? (
                    <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                  ) : null}
                  {editProduct ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;
