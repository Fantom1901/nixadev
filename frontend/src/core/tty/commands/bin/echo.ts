import { CommandDefinition } from '../../executor/CommandRegistry';

export const echoCommand: CommandDefinition = {
  name: 'echo',
  description: 'Вывод строки текста',
  execute: ({ args }) => {
    return {
      stdout: args.join(' ') + '\n',
      stderr: '',
      exitCode: 0,
    };
  },
};