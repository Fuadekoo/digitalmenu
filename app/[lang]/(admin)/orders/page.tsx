"use client";
import React, { useState, useCallback } from "react";
import useAction from "@/hooks/useActions";
import CustomTable from "@/components/custom-table";
import { Button } from "@heroui/react";
import { addToast } from "@heroui/toast";
import {
  getOrder,
  getOrderItems,
  approveOrder,
  rejectOrder,
} from "@/actions/admin/order";
import { Loader2 } from "lucide-react";

interface OrderItem {
  id: string | number;
  key?: string | number;
  orderId: string;
  productId: string;
  photo: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string | number;
  key?: string | number;
  orderCode: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface ColumnDef {
  key: string;
  label: string;
  renderCell?: (item: Record<string, any>) => React.ReactNode;
}

function Page() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderItemsModal, setShowOrderItemsModal] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const [orderData, refreshOrders, isLoadingOrders] = useAction(
    getOrder,
    [true, () => {}],
    search,
    page,
    pageSize
  );

  const [, executeApproveOrder, isLoadingApprove] = useAction(approveOrder, [
    ,
    (response) => {
      if (response) {
        addToast({
          title: "Success",
          description: "Order approved.",
        });
        refreshOrders();
      } else {
        addToast({
          title: "Error",
          description: "Failed to approve order.",
        });
      }
    },
  ]);

  const [, executeRejectOrder, isLoadingReject] = useAction(rejectOrder, [
    ,
    (response) => {
      if (response) {
        addToast({
          title: "Success",
          description: "Order rejected.",
        });
        refreshOrders();
      } else {
        addToast({
          title: "Error",
          description: response || "Failed to reject order.",
        });
      }
    },
  ]);

  const [, getOrderItemsAction, isLoadingOrderItems] = useAction(
    getOrderItems,
    [
      ,
      (items) => {
        if (Array.isArray(items)) {
          setOrderItems(
            items.map((item) => ({
              id: item.id,
              orderId: item.orderId,
              productId: item.productId,
              quantity: item.quantity,
              photo: item.product?.photo || "",
              price: item.price,
            }))
          );
        } else {
          setOrderItems([]);
        }
        setShowOrderItemsModal(true);
      },
    ]
  );

  const handleApproveOrder = async (id: string | number) => {
    await executeApproveOrder(id.toString());
  };

  const handleRejectOrder = async (id: string | number) => {
    await executeRejectOrder(id.toString());
  };

  const handleViewOrderItems = async (order: Order) => {
    setSelectedOrder(order);
    await getOrderItemsAction(order.id.toString());
  };

  const rows = (orderData?.data || []).map((order) => ({
    ...Object.fromEntries(
      Object.entries(order).map(([k, v]) => [
        k,
        v === undefined || v === null ? "" : v.toString(),
      ])
    ),
    key: order.id?.toString(),
    id: order.id?.toString(),
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
      key: "orderCode",
      label: "Order Code",
      renderCell: (item) => item.orderCode,
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      renderCell: (item) => `$${item.totalPrice}`,
    },
    {
      key: "location",
      label: "Location",
      renderCell: (item) => item.location,
    },
    {
      key: "status",
      label: "Status",
      renderCell: (item) => item.status,
    },
    {
      key: "createdAt",
      label: "Created At",
      renderCell: (item) => new Date(item.createdAt).toLocaleDateString(),
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
              handleViewOrderItems({
                id: item.id,
                orderCode: item.orderCode,
                // userId: item.userId,
                totalAmount: Number(item.totalPrice),
                status: item.status,
                createdAt: item.createdAt,
              })
            }
            disabled={isLoadingOrderItems}
          >
            View Items
          </Button>
          <Button
            size="sm"
            color="success"
            variant="flat"
            onPress={() => handleApproveOrder(item.id)}
            disabled={isLoadingApprove}
          >
            {isLoadingApprove ? "Approving..." : "Approve"}
          </Button>
          <Button
            size="sm"
            color="danger"
            variant="flat"
            onPress={() => handleRejectOrder(item.id)}
            disabled={isLoadingReject}
          >
            {isLoadingReject ? "Rejecting..." : "Reject"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <CustomTable
        columns={columns}
        rows={rows}
        totalRows={orderData?.pagination?.totalRecords || 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        searchValue={search}
        onSearch={setSearch}
        isLoading={isLoadingOrders}
      />

      {showOrderItemsModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            {isLoadingOrderItems ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading order items...
              </div>
            ) : (
              <ul>
                {orderItems.map((item) => (
                  <li key={item.id} className="py-2 border-b">
                    Product ID: {item.productId}, Quantity: {item.quantity},
                    Price: ${item.price}
                    {/* Photo: {item.photo} */}
                    <img
                      src={`/api/filedata/${item.photo}`}
                      alt={item.productId}
                      className="w-30 h-30 object-cover rounded mt-2"
                    />
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-end mt-4">
              <Button
                variant="ghost"
                onPress={() => setShowOrderItemsModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;
