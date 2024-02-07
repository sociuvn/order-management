import { Command, Option } from 'commander';
import { listBranchesCommand } from './branches.command';
import { createCustomersCommand } from './customers.command';
import { getInvoiceCommand, syncInvoiceCommand } from './invoices.command';
import { tokenCommand } from './token.command';

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

  const branches = kiotviet.command('branches');

  branches
    .command('list')
    .description('list branches')
    .action(async () => {
      listBranchesCommand();
    });

  const customers = kiotviet.command('customers');

  customers
    .command('create')
    .description('create kiotviet customers from ghtk, ghn, vnpost, viettelpost order')
    .option('-d, --date <yyyy-MM-dd>', 'Purchase Date')
    .addOption(new Option('-f, --from <yyyy-MM-dd>', 'From Purchase Date').conflicts('date'))
    .addOption(new Option('-t, --to <yyyy-MM-dd>', 'To Purchase Date').conflicts('date'))
    .action(async (options) => {
      createCustomersCommand(options);
    });

  const invoices = kiotviet.command('invoices');

  invoices
    .command('get')
    .description('get invoice information')
    .option('-c, --code <value>', 'Kiotviet invoice code')
    .action(async (options) => {
      getInvoiceCommand(options);
    });

  invoices
    .command('sync')
    .description('sync kiotviet invoice with ghtk, ghn, vnpost, viettelpost order')
    .option('-c, --code <value>', 'Kiotviet invoice code')
    .addOption(new Option('-d, --date <yyyy-MM-dd>', 'Purchase Date').conflicts('code'))
    .addOption(new Option('-f, --from <yyyy-MM-dd>', 'From Purchase Date').conflicts('code').conflicts('date'))
    .addOption(new Option('-t, --to <yyyy-MM-dd>', 'To Purchase Date').conflicts('code').conflicts('date'))
    .action(async (options) => {
      syncInvoiceCommand(options);
    });

  return kiotviet;
};
