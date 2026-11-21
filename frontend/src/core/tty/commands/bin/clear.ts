import { CommandDefinition } from '../../executor/CommandRegistry';

export const clearCommand: CommandDefinition = {
  name: 'clear',
  description: 'Очистка экрана терминала',
  execute: () => {
    // В xterm очистка выполняется управляющей ANSI-последовательностью \x1bc
    return {
      stdout: '\x1bc',
      stderr: '',
      exitCode: 0,
    };
  },
};