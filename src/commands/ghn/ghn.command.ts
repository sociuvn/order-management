import { Command } from 'commander';
import { setEnvValue } from '../../util/env.util';
import { VN_TIME_FORMAT } from '../../config/constant';
import { info, log } from '../../util/console';
import { getGHNOrder, showOrders } from '../../services/ghn.service';

export const ghnCommand = (): Command => {
  const ghn = new Command('ghn').description('manage order, get information,...');

  ghn
    .command('token')
    .description('Set GHN token')
    .option('-s, --set <token>', 'Save access token into .env')
    .action(async (options) => {
      try {
        if (options.set) {
          setEnvValue('GHN_TOKEN', options.set);
        }
      } catch (error) {
        console.error(error.message);
      }
    });

  ghn
    .command('get')
    .description('get order information')
    .option('-c, --code <value>', 'order code')
    .option('-d, --date <yyyy-MM-dd>', 'created date')
    .option('-f, --from <yyyy-MM-dd>', 'from date')
    .option('-t, --to <yyyy-MM-dd>', 'to date')
    .action(async (options) => {
      if (options.code) {
        const order = await getGHNOrder(options.code);

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
          fromPurchaseDate = new Date(
            `${date}${VN_TIME_FORMAT}`
          );

          toPurchaseDate = new Date();
          toPurchaseDate.setHours(0, 0, 0, 0);
          toPurchaseDate.setDate(toPurchaseDate.getDate() + 1);
        } else {
          fromPurchaseDate = from
            ? new Date(`${from}${VN_TIME_FORMAT}`)
            : new Date();
          toPurchaseDate = to
            ? new Date(`${to}${VN_TIME_FORMAT}`)
            : new Date();

          toPurchaseDate.setDate(toPurchaseDate.getDate() + 1);
        }
        log(`From: ${fromPurchaseDate}, to: ${toPurchaseDate}`);
        await showOrders(fromPurchaseDate, toPurchaseDate);
      }
    });

  return ghn;
};
