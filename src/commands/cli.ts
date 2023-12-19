#!/usr/bin/env node

import 'dotenv/config';
import { Command } from 'commander';
import { ghtkCommand } from './ghtk/ghtk.command';
import { kiotvietCommand } from './kiotviet/kiotviet.command';
import { vnpostCommand } from './vnpost/vnpost.command';
import { settingCommand } from './setting.command';
import { ghnCommand } from './ghn/ghn.command';

if (process.env.NODE_ENV === 'production')
  console.debug = () => {};

const program = new Command();

function errorColor(str: string) {
  // Add ANSI escape codes to display text in red.
  return `\x1b[31m${str}\x1b[0m`;
}

program
  .configureOutput({
    outputError: (str, write) => write(errorColor(str))
  });

program
  .name('Orders Management CLI')
  .description('CLI to manage invoices, orders')
  .version('0.0.1');

program.addCommand(settingCommand());
program.addCommand(ghtkCommand());
program.addCommand(vnpostCommand());
program.addCommand(ghnCommand());
program.addCommand(kiotvietCommand());
program.showHelpAfterError('(add --help for additional information)');
program.showSuggestionAfterError();
program.parse();


