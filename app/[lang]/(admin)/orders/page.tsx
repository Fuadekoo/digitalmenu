"use client";
import React, { useState, useEffect } from "react";
import useAction from "@/hooks/useActions";
import CustomTable from "@/components/custom-table";
import { Button } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { getOrder, getOrderItems, rejectOrder } from "@/actions/admin/order";
import { sendNotificationToGuest } from "@/actions/common/webpush";
import { useSocket } from "@/components/SocketProvider";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface OrderItem {
  id: string | number;
  key?: string | number;
  orderId: string;
  name: string;
  productId: string;
  photo: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string | number;
  key?: string | number;
  orderCode: string;
  guestId?: string;
  tNumber?: string;
  roomNumber?: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface ColumnDef {
  key: string;
  label: string;
  renderCell?: (item: Record<string, string>) => React.ReactNode;
}

function Page() {
  const socket = useSocket();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderItemsModal, setShowOrderItemsModal] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isApproving, setIsApproving] = useState<string | null>(null);

  const [orderData, refreshOrders, isLoadingOrders] = useAction(
    getOrder,
    [true, () => {}],
    search,
    page,
    pageSize
  );

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
              name: item.tName,
              // tNumber: item.tNumber,
              // roomNumber: item.roomNumber,
              productId: item.productId,
              quantity: item.quantity,
              photo: item.photo,
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

  useEffect(() => {
    if (!socket) return;

    const handleOrderConfirmedSuccess = async (data: { orderId: string }) => {
      addToast({
        title: "Success",
        description: "Order approved successfully.",
      });
      refreshOrders();
      if (isApproving === data.orderId.toString()) {
        setIsApproving(null);
      }

      // Find the order to get guestId
      const order = (orderData?.data || []).find(
        (o) => o.id.toString() === data.orderId.toString()
      );
      if (order?.guestId) {
        await sendNotificationToGuest(
          `Your order (${order.orderCode}) has been confirmed!`,
          order.guestId
        );
      }
    };

    const handleOrderError = (error: { message: string }) => {
      addToast({
        // type: "error",
        title: "Approval Failed",
        description: error.message || "An unknown error occurred.",
      });
      setIsApproving(null);
    };

    socket.on("confirm_order", handleOrderConfirmedSuccess);
    socket.on("order_error", handleOrderError);

    return () => {
      socket.off("confirm_order", handleOrderConfirmedSuccess);
      socket.off("order_error", handleOrderError);
    };
  }, [socket, refreshOrders, isApproving, orderData?.data]);

  const handleApproveOrder = (id: string | number) => {
    if (!socket) {
      addToast({
        // type: "error",
        title: "Connection Error",
        description: "Not connected to the server.",
      });
      return;
    }
    setIsApproving(id.toString());
    socket.emit("confirm_order", { orderId: id.toString() });
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
    tNumber:
      order.table?.tNumber !== undefined && order.table?.tNumber !== null
        ? order.table.tNumber.toString()
        : "",
    roomNumber:
      order.table?.roomNumber !== undefined && order.table?.roomNumber !== null
        ? order.table.roomNumber.toString()
        : "",
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
      key: "tNumber",
      label: "Table Number",
      renderCell: (item) => item.tNumber,
    },
    {
      key: "roomNumber",
      label: "Room Number",
      renderCell: (item) => `${item.roomNumber}`,
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      renderCell: (item) => `${item.totalPrice}`,
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
                tNumber: item.tNumber,
                roomNumber: item.roomNumber,
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
            disabled={isApproving === item.id || item.status !== "pending"}
          >
            {isApproving === item.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Approve"
            )}
          </Button>
          <Button
            size="sm"
            color="danger"
            variant="flat"
            onPress={() => handleRejectOrder(item.id)}
            disabled={isLoadingReject || item.status !== "pending"}
          >
            {isLoadingReject ? "Rejecting..." : "Reject"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="overflow-hidden ">
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
            <h2 className="text-xl font-semibold mb-4">
              Order Items for #{selectedOrder?.orderCode.slice(-5)}
            </h2>
            {isLoadingOrderItems ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading order items...
              </div>
            ) : (
              <ul>
                {orderItems.map((item) => (
                  <li key={item.id} className="py-2 border-b">
                    Product Name: {item.name}, Quantity: {item.quantity}, Price:
                    ${item.price}
                    <div className="mt-2">
                      <Image
                        src={`/api/filedata/${item.photo}`}
                        alt={item.productId}
                        width={120}
                        height={120}
                        className="object-cover rounded"
                      />
                    </div>
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
