import { Command } from 'commander';
import { setEnvValue } from '../util/env.util';

export const settingCommand = (): Command => {
  const setting = new Command('setting').description('setting, config app,...');

  setting
    .command('env')
    .description('Set ENV')
    .option('-k, --key <key>', 'ENV key').requiredOption('value')
    .option('-v, --value <value>', 'ENV value').requiredOption('key')
    .action(async (options) => {
      try {
        if (options.key && options.value) {
          setEnvValue(options.key, options.value);
        }
      } catch (error) {
        console.error(error.message);
      }
    });

  return setting;
};
