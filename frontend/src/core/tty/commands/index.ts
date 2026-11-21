import { CommandDefinition } from '../executor/CommandRegistry';
import { pwdCommand } from './bin/pwd';
import { cdCommand } from './bin/cd';
import { lsCommand } from './bin/ls';
import { catCommand } from './bin/cat';
import { echoCommand } from './bin/echo';
import { clearCommand } from './bin/clear';
import { helpCommand } from './bin/help';
import { mkdirCommand } from './bin/mkdir';
import { chmodCommand } from './bin/chmod';
import { rmCommand } from './bin/rm';

export const builtinCommands: CommandDefinition[] = [
  pwdCommand,
  cdCommand,
  lsCommand,
  catCommand,
  echoCommand,
  clearCommand,
  helpCommand,
  mkdirCommand,
  chmodCommand,
  rmCommand,
];