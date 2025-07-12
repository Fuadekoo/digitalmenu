"use client";
import React, { useState } from "react";
import useAction from "@/hooks/useActions";
import {
  getWaiters,
  createWaiter,
  deleteWaiter,
  updateWaiter,
} from "@/actions/admin/waiters";
import CustomTable from "@/components/custom-table";
import { Button } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

// Define waiter schema
const waiterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
});

interface WaiterItem {
  id: string | number;
  key?: string | number;
  name: string;
  phone: string;
  createdAt?: string;
}

interface ColumnDef {
  key: string;
  label: string;
  renderCell?: (item: Record<string, string>) => React.ReactNode;
}

function Page() {
  const [showModal, setShowModal] = useState(false);
  const [editWaiter, setEditWaiter] = useState<WaiterItem | null>(null);

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof waiterSchema>>({
    resolver: zodResolver(waiterSchema),
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [waiterData, refreshWaiters, isLoadingWaiters] = useAction(
    getWaiters,
    [true, () => {}],
    search,
    page,
    pageSize
  );

  const [, executeDeleteWaiter, isLoadingDelete] = useAction(deleteWaiter, [
    ,
    (response) => {
      if (response) {
        addToast({
          title: "Success",
          description: response?.message || "Waiter deleted.",
        });
        refreshWaiters();
      } else {
        addToast({
          title: "Error",
          description: "Failed to delete waiter.",
        });
      }
    },
  ]);

  const [, waiterAction, isLoadingCreate] = useAction(createWaiter, [
    ,
    (response) => {
      if (response) {
        addToast({
          title: "Success",
          description: response?.message || "Waiter created.",
        });
        setShowModal(false);
        reset();
        refreshWaiters();
      } else {
        addToast({
          title: "Error",
          description: response || "Failed to create waiter.",
        });
      }
    },
  ]);

  const [, updateWaiterAction, isLoadingUpdate] = useAction(updateWaiter, [
    ,
    (response) => {
      if (response) {
        addToast({
          title: "Success",
          description: response?.message || "Waiter updated.",
        });
        setShowModal(false);
        setEditWaiter(null);
        reset();
        refreshWaiters();
      } else {
        addToast({
          title: "Error",
          description: "Failed to update waiter.",
        });
      }
    },
  ]);

  const handleDeleteWaiter = async (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this waiter?")) {
      await executeDeleteWaiter(id.toString());
    }
  };

  const handleEditWaiter = (item: WaiterItem) => {
    setEditWaiter(item);
    setShowModal(true);
    setValue("name", item.name);
    setValue("phone", item.phone);
  };

  const handleAddWaiter = () => {
    setEditWaiter(null);
    reset();
    setShowModal(true);
  };

  const onSubmit = async (data: z.infer<typeof waiterSchema>) => {
    if (editWaiter) {
      updateWaiterAction(editWaiter.id.toString(), data);
    } else {
      waiterAction(data);
    }
  };

  const rows = (waiterData?.data || []).map((waiter) => ({
    ...Object.fromEntries(
      Object.entries(waiter).map(([k, v]) => [
        k,
        v === undefined || v === null ? "" : v.toString(),
      ])
    ),
    key: waiter.id?.toString(),
    id: waiter.id?.toString(),
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
      label: "Waiter Name",
      renderCell: (item) => item.name,
    },
    {
      key: "phone",
      label: "Phone",
      renderCell: (item) => item.phone,
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
              handleEditWaiter({
                id: item.id,
                name: item.name,
                phone: item.phone,
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
            onPress={() => handleDeleteWaiter(item.id)}
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
      <div className="mb-4 flex items-center justify-end">
        <Button color="primary" onPress={handleAddWaiter}>
          Add Waiter
        </Button>
      </div>
      <CustomTable
        columns={columns}
        rows={rows}
        totalRows={waiterData?.pagination.totalRecords || 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        searchValue={search}
        onSearch={setSearch}
        isLoading={isLoadingWaiters}
      />
      {/* Custom Modal for Add/Edit Waiter */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editWaiter ? "Edit Waiter" : "Add Waiter"}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-4">
                <input
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Waiter Name"
                  {...register("name")}
                  disabled={isLoadingCreate || isLoadingUpdate}
                />
                {errors.name && (
                  <span className="text-red-500 text-xs">
                    {errors.name.message}
                  </span>
                )}
                <input
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Phone"
                  {...register("phone")}
                  disabled={isLoadingCreate || isLoadingUpdate}
                />
                {errors.phone && (
                  <span className="text-red-500 text-xs">
                    {errors.phone.message}
                  </span>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="ghost"
                  type="button"
                  onPress={() => {
                    setShowModal(false);
                    setEditWaiter(null);
                    reset();
                  }}
                  disabled={isLoadingCreate || isLoadingUpdate}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  isLoading={editWaiter ? isLoadingUpdate : isLoadingCreate}
                  disabled={editWaiter ? isLoadingUpdate : isLoadingCreate}
                >
                  {(editWaiter ? isLoadingUpdate : isLoadingCreate) ? (
                    <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                  ) : null}
                  {editWaiter ? "Update" : "Add"}
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
