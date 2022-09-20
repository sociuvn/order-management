import { getInvoice as getKiotvietInvoice, getInvoices, updateInvoice } from '../util/kiotviet.util';
import { getOrder as getGHTKOrder } from '../util/ghtk.util';
import { getOrder as getVNPOSTOrder } from '../util/vnpost.util';
import { info, log } from '../util/console';
import { kiotviet } from '../config/kiotviet';
import { KIOTVIET_DELIVERY_STATUS, KIOTVIET_INVOICE_STATUS } from '../config/constant';

const printInvoiceByCode = async (code: string) => {
  try {
    log('Start to get kiotviet invoice data: ' + code);
    const invoice = await getKiotvietInvoice(code);
    info(invoice ? invoice : 'Can not find this invoice!');
  } catch (error) {
    console.error(error.message);
  }
};

const syncInvoiceByCode = async (code: string) => {
  try {
    log('Start to get kiotviet invoice data: ' + code);
    const invoice = await getKiotvietInvoice(code);
    if (invoice) {
      await syncInvoice(invoice);
    } else {
      info(`Can not find invoice with code: ${code}`);
    }
  } catch (error) {
    console.error(error.message);
  }
};

const syncInvoice = async (invoice: any) => {
  try {
    const partnerDelivery = invoice.invoiceDelivery?.partnerDelivery;
    const deliveryCode = invoice.invoiceDelivery?.deliveryCode;

    if (partnerDelivery?.code !== kiotviet.partnerDelivery.GHTK && partnerDelivery?.code !== kiotviet.partnerDelivery.VNPOST) {
      info(`Skip data sync for invoice ${invoice.code} because delivery partner is not be GHTK, VNPOST!`);
      return;
    }

    let data = {};
    if (partnerDelivery?.code === kiotviet.partnerDelivery.GHTK) {
      log('Start to get GHTK order data: ' + deliveryCode);
      const ghtkOrder = await getGHTKOrder(deliveryCode);
      const deliveryDate = ghtkOrder.done_at ? new Date(ghtkOrder.done_at * 1000) : undefined;
      log('--');
      log('Invoice status: ' + getInvoiceStatusText(invoice.status));
      log('Order delivery status: ' + ghtkOrder.status);
      log('Order delivery date: ' + deliveryDate);
      log('--');

      const deliveryStatus = toGHTKDeliveryStatus(ghtkOrder.status);
      data = {
        ...data,
        deliveryDetail: {
          status: deliveryStatus,
          price: ghtkOrder?.fee_ship,
          usingPriceCod: invoice.invoiceDelivery.usingPriceCod,
          expectedDelivery: deliveryDate,
          partnerDelivery: partnerDelivery
        }
      };
    }

    if (partnerDelivery?.code === kiotviet.partnerDelivery.VNPOST) {
      log('Start to get VNPOST order data: ' + deliveryCode);
      const vnpostOrder = await getVNPOSTOrder(deliveryCode);
      const deliveryDate = vnpostOrder.done_at ?? undefined;
      log('--');
      log('Invoice status: ' + getInvoiceStatusText(invoice.status));
      log('Order delivery status: ' + vnpostOrder.status);
      log('Order delivery date: ' + deliveryDate);
      log('--');

      const deliveryStatus = toVNPOSTDeliveryStatus(vnpostOrder.status_code);
      data = {
        ...data,
        deliveryDetail: {
          status: deliveryStatus,
          price: vnpostOrder?.fee_ship,
          usingPriceCod: invoice.invoiceDelivery.usingPriceCod,
          expectedDelivery: deliveryDate,
          partnerDelivery: partnerDelivery
        }
      };
    }

    if (invoice.status === KIOTVIET_INVOICE_STATUS.PROCESSING || invoice.status === KIOTVIET_INVOICE_STATUS.COMPLETE) {
      await updateInvoice(invoice.id, data);
      info('Sync invoice data done: ' + invoice.code);
    } else {
      info('Can not update data for this invoice');
    }
  } catch (error) {
    console.error(error.message);
  }
};

const syncInvoices = async (status: number, fromPurchaseDate: Date, toPurchaseDate: Date) => {
  try {
    const invoices = await getInvoices(status, fromPurchaseDate.toUTCString(), toPurchaseDate.toUTCString());
    info(`Find ${invoices.length} invoices from ${fromPurchaseDate.toLocaleDateString()} to ${toPurchaseDate.toLocaleDateString()}!`);

    for (const invoice of invoices) {
      await syncInvoice(invoice);
      info('--------------------------------------------------------');
    }
  } catch (error) {
    console.error(error.message);
  }
};

const toGHTKDeliveryStatus = (ghtkOrderStatus: string): number => {
  switch (ghtkOrderStatus) {
    case 'Đã giao hàng':
    case 'Đã giao hàng/Chưa đối soát':
    case 'Đã đối soát':
      return KIOTVIET_DELIVERY_STATUS.COMPLETE;
    default:
      return KIOTVIET_DELIVERY_STATUS.PROCESSING;
  }
};

const toVNPOSTDeliveryStatus = (vnpostOrderStatus: number): number => {
  switch (vnpostOrderStatus) {
    case 100: // Phát thành công
    case 110: // Chờ trả tiền
    case 120: // Đã trả tiền
      return KIOTVIET_DELIVERY_STATUS.COMPLETE;
    default:
      return KIOTVIET_DELIVERY_STATUS.PROCESSING;
  }
};

const getInvoiceStatusText = (status: KIOTVIET_INVOICE_STATUS) => {
  switch (status) {
    case KIOTVIET_INVOICE_STATUS.COMPLETE:
      return 'Đã hoàn thành';
    case KIOTVIET_INVOICE_STATUS.CANCEL:
      return 'Đã hủy';
    case KIOTVIET_INVOICE_STATUS.PROCESSING:
      return 'Đang xử lý';
    case KIOTVIET_INVOICE_STATUS.UNCOMPLETE:
      return 'Chưa hoàn thành';
    default:
      return '';
  }
};

export { printInvoiceByCode, syncInvoiceByCode, syncInvoice, syncInvoices, getInvoiceStatusText };
