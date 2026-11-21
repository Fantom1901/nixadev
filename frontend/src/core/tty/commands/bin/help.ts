import { CommandDefinition } from '../../executor/CommandRegistry';

export const helpCommand: CommandDefinition = {
  name: 'help',
  description: 'Справка по доступным командам',
  execute: () => {
    const helpText = [
      'Доступные POSIX-утилиты:',
      '  ls [path] [-la]   - Содержимое директории',
      '  cd <path>        - Смена текущей папки',
      '  pwd              - Текущий путь',
      '  cat <file>       - Чтение содержимого файла',
      '  echo <text>      - Вывод текста',
      '  clear            - Очистить экран',
      '  help             - Эта справка',
      '',
      'Поддерживаются пайпы (|), редиректы (>, >>) и запуск .sh скриптов.',
    ].join('\n');

    return {
      stdout: helpText + '\n',
      stderr: '',
      exitCode: 0,
    };
  },
};