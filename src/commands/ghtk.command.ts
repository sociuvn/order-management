import { Command } from 'commander';
import { getGHTKOrder } from '../services/ghtk.service';
import { info } from '../util/console';

export const ghtkCommand = (): Command => {
  const ghtk = new Command('ghtk').description('manage order, get information,...');

  ghtk
    .command('get')
    .description('get order information')
    .option('-c, --code <value>', 'order code')
    .option('-d, --date <yyyy-MM-dd>', 'created date')
    .option('-f, --from <yyyy-MM-dd>', 'from date')
    .option('-t, --to <yyyy-MM-dd>', 'to date')
    .action(async (options) => {
      if (options.code) {
        info(await getGHTKOrder(options.code));
      }
    });

    return ghtk;
};
