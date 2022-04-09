import { Command } from 'commander';
import { log } from '../util/console';
import { getOrder } from '../util/ghtk.util';

export const ghtkCommand = (): Command => {
  const ghtk = new Command('ghtk');
  ghtk
    .command('get')
    .option('-c, --code <value>')
    .option('-d, --date <value>')
    .option('-f, --from <value>')
    .option('-t, --to <value>')
    .action(async (options) => {
      log(process.env.NODE_ENV);
      log(options.code);
      log(await getOrder(options.code));
    });

    return ghtk;
};
