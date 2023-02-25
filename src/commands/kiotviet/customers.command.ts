import * as kiotvietService from '../../services/kiotviet.service';
import { UTC_TIME_FORMAT } from '../../config/constant';
import { log } from '../../util/console';

const createCustomersCommand = async (options: any) => {
  try {
    const { date, from, to } = options;
    let fromPurchaseDate;
    let toPurchaseDate;
    if (date) {
      fromPurchaseDate = toPurchaseDate = new Date(`${date}${UTC_TIME_FORMAT}`);
    } else {
      fromPurchaseDate = from ? new Date(`${from}${UTC_TIME_FORMAT}`) : new Date();
      toPurchaseDate = to ? new Date(`${to}${UTC_TIME_FORMAT}`) : new Date();
    }
    log(`From: ${fromPurchaseDate}, to: ${toPurchaseDate}`);
    await kiotvietService.createCustomers(fromPurchaseDate, toPurchaseDate);
  } catch (error) {
    console.error(error.message);
  }
};

export { createCustomersCommand };
