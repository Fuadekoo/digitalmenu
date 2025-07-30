// --- Shared Constants ---
export const SocketEvents = {
  // Client to Server
  REGISTER_TABLE: "register_table_socket",
  CREATE_ORDER: "create_order",
  CONFIRM_ORDER: "confirm_order",
  JOIN_ADMIN_ROOM: "join_admin_room",

  // Server to Client
  ORDER_CREATED_SUCCESS: "order_created_successfully",
  NEW_ORDER_NOTIFICATION: "new_order_notification",
  ORDER_STATUS_UPDATE: "order_status_update",

  // Connection Events
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  ERROR: "error",

  // Error Events
  GENERAL_ERROR: "socket_error",
  ORDER_ERROR: "order_error",
};
