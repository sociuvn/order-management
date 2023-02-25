import * as kiotvietService from '../../services/kiotviet.service';
import { KIOTVIET_INVOICE_STATUS, VN_TIME_FORMAT } from '../../config/constant';

const getInvoiceCommand = async (options: any) => {
  try {
    if (options.code) {
      await kiotvietService.printInvoiceByCode(options.code);
    }
  } catch (error) {
    console.error(error.message);
  }
};

const syncInvoiceCommand = async (options: any) => {
  try {
    if (options.code) {
      kiotvietService.syncInvoiceByCode(options.code);
    }

    if (options.date || options.from || options.to) {
      let fromPurchaseDate;
      let toPurchaseDate;
      if (options.date) {
        fromPurchaseDate = toPurchaseDate = new Date(`${options.date}${VN_TIME_FORMAT}`);
      }

      if (options.from && !fromPurchaseDate) {
        fromPurchaseDate = new Date(`${options.from}${VN_TIME_FORMAT}`);
        toPurchaseDate = options.to ? new Date(`${options.to}${VN_TIME_FORMAT}`) : new Date();
      }

      if (options.to && !toPurchaseDate) {
        toPurchaseDate = new Date(`${options.to}${VN_TIME_FORMAT}`);
        fromPurchaseDate = options.from ? new Date(`${options.from}${VN_TIME_FORMAT}`) : toPurchaseDate;
      }

      await kiotvietService.syncInvoices(KIOTVIET_INVOICE_STATUS.PROCESSING, fromPurchaseDate, toPurchaseDate);
    }
  } catch (error) {
    console.error(error.message);
  }
};

export { getInvoiceCommand, syncInvoiceCommand };
