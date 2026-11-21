import { CommandDefinition } from '../../executor/CommandRegistry';

export const pwdCommand: CommandDefinition = {
  name: 'pwd',
  description: 'Печать текущей рабочей директории',
  execute: ({ env }) => {
    const pwd = env.get('PWD') || '/';
    return {
      stdout: `${pwd}\n`,
      stderr: '',
      exitCode: 0,
    };
  },
};