import { Command, Option } from 'commander';
import { setEnvValue } from '../util/env.util';
import { info, log } from '../util/console';
import { getAccessToken, getOrder as getKiotvietOrder, getOrders, mapOrderStatus, updateOrder } from '../util/kiotviet.util';
import { getOrder as getGHTKOrder } from '../util/ghtk.util';
import { kiotviet } from '../config/kiotviet';

export const kiotvietCommand = (): Command => {
  const kiotviet = new Command('kiotviet');
  kiotviet
    .command('token')
    .option('-g, --get')
    .option('-s, --set')
    .action(async (options) => {
      tokenCommand(options);
    });

  kiotviet
    .command('get')
    .option('-c, --code <value>')
    .action(async (options) => {
      getCommand(options);
    });

  kiotviet
    .command('sync')
    .option('-c, --code <value>', 'Kiotviet order code')
    .addOption(new Option('-d, --date <value>', 'Purchase Date').conflicts('code'))
    .action(async (options) => {
      syncCommand(options);
    });

  return kiotviet;
};

const tokenCommand = async (options: any) => {
  try {
    const accessToken = await getAccessToken();
    if (options.get) {
      log(accessToken);
    }

    if (options.set) {
      setEnvValue('KIOTVIET_TOKEN', accessToken);
    }
  } catch (error) {
    console.error(error.message);
  }
};

const getCommand = async (options: any) => {
  try {
    if (options.code) {
      const order = await getKiotvietOrder(options.code);
      info(order);
    }
  } catch (error) {
    console.error(error.message);
  }
};


const syncCommand = async (options: any) => {
  try {
    if (options.code) {
      log('Start to get kiotviet order data: ' + options.code);
      const order = await getKiotvietOrder(options.code);
      const partnerDelivery = order.invoiceDelivery.partnerDelivery;
      const deliveryCode = order.invoiceDelivery.deliveryCode;

      if (partnerDelivery.code !== kiotviet.partnerDelivery.GHTK) {
        info('Skip data sync because delivery partner is not be GHTK!');
        return;
      }

      log('Start to get GHTK order data: ' + deliveryCode);
      const ghtkOrder = await getGHTKOrder(deliveryCode);
      const deliveryDate = ghtkOrder.done_at ? new Date(ghtkOrder.done_at * 1000) : undefined;
      log('-------');
      log('Order delivery status: ' + ghtkOrder.status);
      log('Order delivery date: ' + deliveryDate);
      log('-------');

      const deliveryStatus = mapOrderStatus(ghtkOrder.status);
      const data = {
        deliveryDetail: {
          status: deliveryStatus,
          usingPriceCod: order.invoiceDelivery.usingPriceCod,
          expectedDelivery: deliveryDate,
          partnerDelivery: partnerDelivery
        }
      };

      log('Start to sync order data: ' + options.code);
      await updateOrder(order.id, data);
    }

    if (options.date) {
      const purchaseDate = new Date(`${options.date}T00:00:00+07:00`);
      const result = await getOrders(3, purchaseDate.toUTCString(), purchaseDate.toUTCString());
    }
  } catch (error) {
    console.error(error.message);
  }
};
