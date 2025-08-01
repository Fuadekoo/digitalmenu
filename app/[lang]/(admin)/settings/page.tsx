"use client";
import React, { useState } from "react";
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

type Promotion = z.infer<typeof promotionSchema> & {
  id: string;
  createdAt?: string;
  photo?: string;
};

function SettingsPage() {
  const [showModal, setShowModal] = useState(false);
  const [editPromotion, setEditPromotion] = useState<Promotion | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isConvertingImage, setIsConvertingImage] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors },
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

  const handleActionSuccess = (message: string) => {
    addToast({ title: "Success", description: message });
    setShowModal(false);
    setEditPromotion(null);
    setImagePreview(null);
    reset();
    refreshPromotions();
  };

  const [, executeDelete, isLoadingDelete] = useAction(deletePromotion, [
    ,
    () => {},
  ]);

  const [, executeCreate, isLoadingCreate] = useAction(createPromotion, [
    ,
    (response) => {
      if (response) {
        handleActionSuccess("Promotion created successfully");
      } else {
        addToast({
          title: "Error",
          description: "Failed to create promotion",
        });
      }
    },
  ]);

  const [, executeUpdate, isLoadingUpdate] = useAction(updatePromotion, [
    ,
    () => {},
  ]);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsConvertingImage(true);
      setImagePreview(null);
      setValue("photo", "", { shouldValidate: false });

      try {
        const fileBuffer = await file.arrayBuffer();
        const base64String = Buffer.from(fileBuffer).toString("base64");
        const dataUrl = `data:${file.type};base64,${base64String}`;
        setValue("photo", dataUrl, { shouldValidate: true });
        setImagePreview(dataUrl);
      } catch {
        addToast({
          title: "Image Error",
          description: "Could not process the file.",
        });
      } finally {
        setIsConvertingImage(false);
      }
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this promotion?")) {
      executeDelete(id);
    }
  };

  const openEditModal = (item: Promotion) => {
    setEditPromotion(item);
    setValue("title", item.title);
    setValue("description", item.description);
    setValue("photo", item.photo); // Use 'photo' from DB for the form
    setImagePreview(item.photo || null);
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditPromotion(null);
    reset();
    setImagePreview(null);
    setShowModal(true);
  };

  const onSubmit = (data: z.infer<typeof promotionSchema>) => {
    if (editPromotion) {
      executeUpdate(editPromotion.id, data);
    } else {
      executeCreate(data);
    }
  };

  const columns = [
    {
      key: "index",
      label: "#",
      renderCell: (_: any, idx: number) => (page - 1) * pageSize + idx + 1,
    },
    { key: "title", label: "Title" },
    { key: "description", label: "Description" },
    { key: "photo", label: "Proof" },
    {
      key: "createdAt",
      label: "Created At",
      renderCell: (item: Promotion) =>
        item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A",
    },
    {
      key: "actions",
      label: "Actions",
      renderCell: (item: Promotion) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            color="primary"
            variant="flat"
            onPress={() => openEditModal(item)}
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
  ];

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
        rows={promotionData?.data || []}
        totalRows={promotionData?.pagination.totalRecords || 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        searchValue={search}
        onSearch={setSearch}
        isLoading={isLoadingPromotions}
        rowKey="id"
      />

      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
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
                  onChange={handleFileChange}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  disabled={isConvertingImage}
                />
                {isConvertingImage && (
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    Processing...
                  </div>
                )}
              </div>
              {imagePreview && !isConvertingImage && (
                <div className="mt-2 border rounded-md p-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-40 rounded mx-auto"
                  />
                </div>
              )}
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="ghost"
                  type="button"
                  onPress={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  isLoading={isLoadingCreate || isLoadingUpdate}
                >
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
