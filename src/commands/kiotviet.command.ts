import { Command, Option } from 'commander';
import { setEnvValue } from '../util/env.util';
import { log } from '../util/console';
import { getAccessToken } from '../util/kiotviet.util';
import * as kiotvietService from '../services/kiotviet.service';
import { KIOTVIET_INVOICE_STATUS, VN_TIME_FORMAT } from '../config/constant';

export const kiotvietCommand = (): Command => {
  const kiotviet = new Command('kiotviet').description('manage, sync invoice, order,...');
  kiotviet
    .command('token')
    .description('get, set access token')
    .option('-g, --get', 'Get access token')
    .option('-s, --set', 'Save access token into .env')
    .action(async (options) => {
      tokenCommand(options);
    });

  kiotviet
    .command('get')
    .description('get invoice information')
    .option('-c, --code <value>', 'Kiotviet invoice code')
    .action(async (options) => {
      getCommand(options);
    });

  kiotviet
    .command('sync')
    .description('sync kiotviet invoice with ghtk order')
    .option('-c, --code <value>', 'Kiotviet invoice code')
    .addOption(new Option('-d, --date <yyyy-MM-dd>', 'Purchase Date').conflicts('code'))
    .addOption(new Option('-f, --from <yyyy-MM-dd>', 'From Purchase Date').conflicts('code').conflicts('date'))
    .addOption(new Option('-t, --to <yyyy-MM-dd>', 'To Purchase Date').conflicts('code').conflicts('date'))
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
      await kiotvietService.printInvoiceByCode(options.code);
    }
  } catch (error) {
    console.error(error.message);
  }
};


const syncCommand = async (options: any) => {
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
