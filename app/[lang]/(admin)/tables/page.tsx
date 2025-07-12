"use client";
import React, { useState } from "react";
import useAction from "@/hooks/useActions";
import {
  getTables,
  getWaiterData,
  getTableQRCode,
  deleteTable,
  createTable,
  updateTable,
} from "@/actions/admin/table";
import CustomTable from "@/components/custom-table";
import { Button } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { z } from "zod";
import { tableSchema } from "@/lib/zodSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import QRCode from "qrcode";

interface TableItem {
  id: string | number;
  key?: string | number;
  name: string;
  tNumber?: number;
  waiterId?: string;
  createdAt?: string;
}

interface WaiterItem {
  id: string;
  name: string;
}

interface ColumnDef {
  key: string;
  label: string;
  renderCell?: (item: Record<string, string>) => React.ReactNode;
}

function Page() {
  const [showModal, setShowModal] = useState(false);
  const [editTable, setEditTable] = useState<TableItem | null>(null);

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors },
    watch,
  } = useForm<z.infer<typeof tableSchema>>({
    resolver: zodResolver(tableSchema),
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [tableData, refreshTables, isLoadingTables] = useAction(
    getTables,
    [true, () => {}],
    search,
    page,
    pageSize
  );

  const [waiterData, refreshWaiters, isLoadingWaiters] = useAction(
    getWaiterData,
    [true, () => {}]
  );

  const [, executeDeleteTable, isLoadingDelete] = useAction(deleteTable, [
    ,
    (response) => {
      if (response) {
        addToast({
          title: "Success",
          description: response?.message || "Table deleted.",
        });
        refreshTables();
      } else {
        addToast({
          title: "Error",
          description: response || "Failed to delete table.",
        });
      }
    },
  ]);

  const [, tableAction, isLoadingCreate] = useAction(createTable, [
    ,
    (response) => {
      if (response) {
        addToast({
          title: "Success",
          description: "Table created.",
        });
        setShowModal(false);
        reset();
        refreshTables();
      } else {
        addToast({
          title: "Error",
          description: response || "Failed to create table.",
        });
      }
    },
  ]);

  const [, updateTableAction, isLoadingUpdate] = useAction(updateTable, [
    ,
    (response) => {
      if (response) {
        addToast({
          title: "Success",
          description: "Table updated.",
        });
        setShowModal(false);
        setEditTable(null);
        reset();
        refreshTables();
      } else {
        addToast({
          title: "Error",
          description: response || "Failed to update table.",
        });
      }
    },
  ]);

  // Generate PDF for a single table's QR code
  const handleDownloadSingleQrPdf = async (table: TableItem) => {
    const doc = new jsPDF();

    // Get QR code string for this table
    const qrCodeString = await getTableQRCode(table.id.toString());
    // Generate QR code image
    const qrDataUrl = await QRCode.toDataURL(qrCodeString);

    // Centered title
    doc.setFontSize(18);
    doc.text(`Table QR Code`, doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

    // Table info box
    doc.setFontSize(12);
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(20, 30, 170, 25, 5, 5, 'F');
    doc.text(`Name: ${table.name}`, 25, 40);
    doc.text(`Number: ${table.tNumber ?? "-"}`, 25, 50);

    // Waiter info
    if (table.waiterId && waiterData) {
      const waiter = waiterData.find((w: WaiterItem) => w.id === table.waiterId);
      if (waiter) {
        doc.text(`Waiter: ${waiter.name}`, 120, 40);
      }
    }

    // QR code centered below info
    const qrSize = 80;
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.addImage(qrDataUrl, "PNG", (pageWidth - qrSize) / 2, 65, qrSize, qrSize);

    doc.save(`table-${table.tNumber || table.name}-qrcode.pdf`);
  };

  const handleDeleteTable = async (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this table?")) {
      await executeDeleteTable(id.toString());
    }
  };

  const handleEditTable = (item: TableItem) => {
    setEditTable(item);
    setShowModal(true);
    setValue("name", item.name);
    setValue("tNumber", item.tNumber ?? 100);
    setValue("waiterId", item.waiterId ?? "");
  };

  const handleAddTable = () => {
    setEditTable(null);
    reset();
    setShowModal(true);
  };

  const onSubmit = async (data: z.infer<typeof tableSchema>) => {
    const { name, tNumber, waiterId } = data;
    if (editTable) {
      updateTableAction(editTable.id.toString(), { name, tNumber, waiterId });
    } else {
      tableAction({ name, tNumber, waiterId });
    }
  };

  const rows = (tableData?.data || []).map((table) => ({
    ...Object.fromEntries(
      Object.entries(table).map(([k, v]) => [
        k,
        v === undefined || v === null ? "" : v.toString(),
      ])
    ),
    key: table.id?.toString(),
    id: table.id?.toString(),
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
      label: "Table Name",
      renderCell: (item) => item.name,
    },
    {
      key: "tNumber",
      label: "Table Number",
      renderCell: (item) => item.tNumber,
    },
    {
      key: "waiterId",
      label: "Waiter",
      renderCell: (item) => {
        const waiter = waiterData?.find(
          (w: WaiterItem) => w.id === item.waiterId
        );
        return waiter ? waiter.name : item.waiterId;
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
            color="secondary"
            onPress={() =>
              handleDownloadSingleQrPdf({
                id: item.id,
                name: item.name,
                tNumber: item.tNumber ? Number(item.tNumber) : undefined,
                waiterId: item.waiterId,
                createdAt: item.createdAt,
              })
            }
          >
            QR PDF
          </Button>
          <Button
            size="sm"
            color="primary"
            variant="flat"
            onPress={() =>
              handleEditTable({
                id: item.id,
                name: item.name,
                tNumber: item.tNumber ? Number(item.tNumber) : undefined,
                waiterId: item.waiterId,
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
            onPress={() => handleDeleteTable(item.id)}
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
        <Button color="primary" onPress={handleAddTable}>
          Add Table
        </Button>
      </div>
      <CustomTable
        columns={columns}
        rows={rows}
        totalRows={tableData?.pagination.totalRecords || 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        searchValue={search}
        onSearch={setSearch}
        isLoading={isLoadingTables}
      />
      {/* Custom Modal for Add/Edit Table */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editTable ? "Edit Table" : "Add Table"}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-4">
                <input
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Table Name"
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
                  placeholder="Table Number"
                  type="number"
                  {...register("tNumber", { valueAsNumber: true })}
                  disabled={isLoadingCreate || isLoadingUpdate}
                />
                {errors.tNumber && (
                  <span className="text-red-500 text-xs">
                    {errors.tNumber.message}
                  </span>
                )}
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  {...register("waiterId")}
                  disabled={
                    isLoadingCreate || isLoadingUpdate || isLoadingWaiters
                  }
                  defaultValue={watch("waiterId") || ""}
                >
                  <option value="">Select Waiter</option>
                  {waiterData?.map((waiter: WaiterItem) => (
                    <option key={waiter.id} value={waiter.id}>
                      {waiter.name}
                    </option>
                  ))}
                </select>
                {errors.waiterId && (
                  <span className="text-red-500 text-xs">
                    {errors.waiterId.message}
                  </span>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="ghost"
                  type="button"
                  onPress={() => {
                    setShowModal(false);
                    setEditTable(null);
                    reset();
                  }}
                  disabled={isLoadingCreate || isLoadingUpdate}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  isLoading={editTable ? isLoadingUpdate : isLoadingCreate}
                  disabled={editTable ? isLoadingUpdate : isLoadingCreate}
                >
                  {(editTable ? isLoadingUpdate : isLoadingCreate) ? (
                    <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                  ) : null}
                  {editTable ? "Update" : "Add"}
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
