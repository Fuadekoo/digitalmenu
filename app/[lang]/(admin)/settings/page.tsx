"use client";
import React, { useState, useMemo } from "react";
import {
  getPromotions,
  createPromotion,
  deletePromotion,
  updatePromotion,
} from "@/actions/admin/promotion";
import CustomTable from "@/components/custom-table";
import useAction from "@/hooks/useActions";
import { Button } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { promotionSchema } from "@/lib/zodSchema";
import { Loader2 } from "lucide-react";
import { sendNotificationToAll } from "@/actions/common/webpush";
import Image from "next/image";

type Promotion = z.infer<typeof promotionSchema> & {
  id: string;
  createdAt?: string;
  photo?: string;
};

type ColumnDef = {
  key: string;
  label: string;
  renderCell?: (item: Record<string, string>) => React.ReactNode;
};

function SettingsPage() {
  const [showModal, setShowModal] = useState(false);
  const [editPromotion, setEditPromotion] = useState<Promotion | null>(null);
  const [photoValue, setPhotoValue] = useState<string | null>(null); // Base64 or URL
  const [isConvertingImage, setIsConvertingImage] = useState(false); // Loading state

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof promotionSchema>>({
    resolver: zodResolver(promotionSchema),
    mode: "onChange",
  });

  const [promotionData, refreshPromotions, isLoadingPromotions] = useAction(
    getPromotions,
    [true, () => {}],
    search,
    page,
    pageSize
  );

  // Convert all row fields to string for CustomTable compatibility
  const rows =
    (promotionData?.data || []).map((item) => ({
      ...item,
      id: String(item.id),
      title: item.title ?? "",
      description: item.description ?? "",
      photo: item.photo ?? "",
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : "",
      updatedAt: item.updatedAt
        ? typeof item.updatedAt === "string"
          ? item.updatedAt
          : new Date(item.updatedAt).toISOString()
        : "",
    })) || [];

  // --- Actions ---
  const handleActionCompletion = (
    response: unknown,
    successMessage: string,
    errorMessage: string
  ) => {
    if (response) {
      addToast({ title: "Success", description: successMessage });
      refreshPromotions();
      setShowModal(false);
      setEditPromotion(null);
      setPhotoValue(null);
      reset();
    } else {
      addToast({
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const [, executeDelete, isLoadingDelete] = useAction(deletePromotion, [
    ,
    (res) =>
      handleActionCompletion(
        res,
        "Promotion deleted successfully.",
        "Failed to delete promotion."
      ),
  ]);

  const [, executeCreate, isLoadingCreate] = useAction(createPromotion, [
    ,
    (res) =>
      handleActionCompletion(
        res,
        "Promotion created successfully.",
        "Failed to create promotion."
      ),
  ]);

  const [, executeUpdate, isLoadingUpdate] = useAction(updatePromotion, [
    ,
    (res) =>
      handleActionCompletion(
        res,
        "Promotion updated successfully.",
        "Failed to update promotion."
      ),
  ]);

  // --- File/Image Handling ---

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

  // --- Table Actions ---
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this promotion?")) {
      executeDelete(id);
    }
  };

  const openEditModal = (item: Promotion) => {
    setEditPromotion(item);
    setValue("title", item.title);
    setValue("description", item.description);
    setValue("photo", item.photo);
    setPhotoValue(item.photo || null);
    setShowModal(true);
  };

  // --- Table Columns ---
  const columns: ColumnDef[] = useMemo(
    () => [
      {
        key: "autoId",
        label: "#",
        renderCell: (item) => {
          const rowIndexOnPage = rows.findIndex((r) => r.id === item.id);
          if (rowIndexOnPage !== -1) {
            return (page - 1) * pageSize + rowIndexOnPage + 1;
          }
          return item.id;
        },
      },
      { key: "title", label: "Title" },
      { key: "description", label: "Description" },
      // {
      //   key: "photo",
      //   label: "Proof",
      //   renderCell: (item) =>
      //     item.photo ? (
      //       <img
      //         src={item.photo}
      //         alt="Promotion"
      //         className="h-12 w-12 object-cover rounded"
      //       />
      //     ) : (
      //       <span className="text-gray-400">No image</span>
      //     ),
      // },
      { key: "photo", label: "Proof" },
      {
        key: "createdAt",
        label: "Created At",
        renderCell: (item) =>
          item.createdAt
            ? new Date(item.createdAt).toLocaleDateString()
            : "N/A",
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
              onPress={() => openEditModal(item as Promotion)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              color="danger"
              variant="flat"
              onPress={() => handleDelete(item.id)}
              isLoading={isLoadingDelete}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [rows, page, pageSize, isLoadingDelete, handleDelete, openEditModal]
  );

  const openAddModal = () => {
    setEditPromotion(null);
    reset();
    setPhotoValue(null);
    setShowModal(true);
  };

  const onSubmit = (data: z.infer<typeof promotionSchema>) => {
    if (editPromotion) {
      executeUpdate(editPromotion.id, data);
      sendNotificationToAll("hello customer , a new promotion has been added!");
    } else {
      executeCreate(data);
      sendNotificationToAll("hello customer , a new promotion has been added!");
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Promotions Management
      </h1>
      <div className="mb-4 flex items-center justify-end">
        <Button color="primary" onPress={openAddModal}>
          Add Promotion
        </Button>
      </div>
      <CustomTable
        columns={columns}
        rows={rows}
        totalRows={promotionData?.pagination?.totalRecords || 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        searchValue={search}
        onSearch={setSearch}
        isLoading={isLoadingPromotions}
        // rowKey="id"
      />

      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editPromotion ? "Edit Promotion" : "Add Promotion"}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <input
                  {...register("title")}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Promotion Title"
                  disabled={isLoadingCreate || isLoadingUpdate || isSubmitting}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>
              <div>
                <textarea
                  {...register("description")}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Description"
                  disabled={isLoadingCreate || isLoadingUpdate || isSubmitting}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Promotion Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  {...register("photo", { onChange: handleImageChange })}
                  // onChange={handleFileChange}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  disabled={
                    isConvertingImage ||
                    isLoadingCreate ||
                    isLoadingUpdate ||
                    isSubmitting
                  }
                />
                {isConvertingImage && (
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    Processing...
                  </div>
                )}
              </div>
              {photoValue && !isConvertingImage && (
                <div className="mt-2 border rounded-md p-2">
                  <Image
                    src={photoValue}
                    alt="Preview"
                    className="max-h-40 rounded mx-auto"
                    width={160}
                    height={160}
                    style={{ objectFit: "contain" }}
                  />
                </div>
              )}
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="ghost"
                  type="button"
                  onPress={() => setShowModal(false)}
                  disabled={isLoadingCreate || isLoadingUpdate || isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  isLoading={isLoadingCreate || isLoadingUpdate || isSubmitting}
                  disabled={isLoadingCreate || isLoadingUpdate || isSubmitting}
                >
                  {(isLoadingCreate || isLoadingUpdate || isSubmitting) && (
                    <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                  )}
                  {editPromotion ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
