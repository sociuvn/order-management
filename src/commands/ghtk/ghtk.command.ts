import { Command } from 'commander';
import { setEnvValue } from '../../util/env.util';
import { getGHTKOrder } from '../../services/ghtk.service';
import { info } from '../../util/console';

export const ghtkCommand = (): Command => {
  const ghtk = new Command('ghtk').description('manage order, get information,...');

  ghtk
    .command('token')
    .description('Set GHTK access token')
    .option('-s, --set <token>', 'Save access token into .env')
    .action(async (options) => {
      try {
        if (options.set) {
          setEnvValue('GHTK_TOKEN', options.set);
        }
      } catch (error) {
        console.error(error.message);
      }
    });

  ghtk
    .command('get')
    .description('get order information')
    .option('-c, --code <value>', 'order code')
    .option('-d, --date <yyyy-MM-dd>', 'created date')
    .option('-f, --from <yyyy-MM-dd>', 'from date')
    .option('-t, --to <yyyy-MM-dd>', 'to date')
    .action(async (options) => {
      if (options.code) {
        const order = await getGHTKOrder(options.code);
        order ? info(await getGHTKOrder(options.code))
          : info(`❌ Can not find order with code: ${options.code}`);
      }
    });

    return ghtk;
};
