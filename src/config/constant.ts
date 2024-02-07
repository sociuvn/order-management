export const VN_TIME_FORMAT = 'T00:00:00+07:00';
export const UTC_TIME_FORMAT = 'T00:00:00+00:00';
export const enum KIOTVIET_INVOICE_STATUS {
  COMPLETE = 1,
  CANCEL = 2,
  PROCESSING = 3,
  UNCOMPLETE = 5,
}

export const enum KIOTVIET_DELIVERY_STATUS {
  TAKEN = 9, // Đã lấy hàng
  TAKING = 7, // Đang lấy hàng
  RETURNNING = 4, // Đang chuyển hoàn
  COMPLETE = 3, // Giao thành công
  DELIVERING = 2, // Đang giao hàng
  PROCESSING = 1, // Chờ xử lý
}
