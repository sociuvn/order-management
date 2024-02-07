import { Command } from 'commander';
import { setEnvValue } from '../../util/env.util';
import { UTC_TIME_FORMAT } from '../../config/constant';
import { showOrders } from '../../services/viettelpost.service';
import { info, log } from '../../util/console';
import { getViettelPostOrder } from '../../services/viettelpost.service';

export const viettelpostCommand = (): Command => {
  const vnpost = new Command('viettelpost').description('manage order, get information,...');

  vnpost
    .command('token')
    .description('Set ViettelPost access token')
    .option('-s, --set <token>', 'Save access token into .env')
    .action(async (options) => {
      try {
        if (options.set) {
          setEnvValue('VTPOST_TOKEN', options.set);
        }
      } catch (error) {
        console.error(error.message);
      }
    });

  vnpost
    .command('get')
    .description('get order information')
    .option('-c, --code <value>', 'order code')
    .option('-d, --date <yyyy-MM-dd>', 'created date')
    .option('-f, --from <yyyy-MM-dd>', 'from date')
    .option('-t, --to <yyyy-MM-dd>', 'to date')
    .action(async (options) => {
      if (options.code) {
        const order = await getViettelPostOrder(options.code);

        if (order) {
          info(order);
        } else {
          info(`❌ Can not find order with code: ${options.code}`);
        }
      }

      if (options.date || options.from || options.to) {
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
        await showOrders(fromPurchaseDate, toPurchaseDate);
      }
    });

  return vnpost;
};
