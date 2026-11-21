import { VirtualFS } from '../fs/VirtualFS';
import { Environment } from '../executor/Environment';

// Результат выполнения команды (POSIX exit status + streams)
export interface CommandOutput {
  stdout: string;             // Стандартный поток вывода
  stderr: string;             // Поток ошибок
  exitCode: number;           // 0 — успех, !0 — ошибка
}

// Контекст окружения, передаваемый в каждую команду при запуске
export interface ExecutionContext {
  fs: VirtualFS;              // Экземпляр виртуальной ФС
  env: Environment;           // Переменные окружения ($PWD, $USER, $PATH и т.д.)
  stdin?: string;             // Входной поток (для работы пайпов '|')
}

// Интерфейс для реализации любой POSIX-команды (/bin/ls, /bin/cat и т.д.)
export interface ICommand {
  name: string;               // Имя команды (например, 'ls')
  description: string;        // Краткое описание для справки (help)
  usage: string;              // Формат использования (например, 'cat <file>')

  /**
   * Запуск команды
   * @param args - Аргументы строки (без самого имени команды)
   * @param context - Контекст (ФС, окружение, stdin)
   */
  execute(args: string[], context: ExecutionContext): Promise<CommandOutput> | CommandOutput;
}

// Структура разобранной команды после лексического анализа (пайпы, редиректы)
export interface ParsedCommand {
  name: string;               // Имя исполняемого файла / команды
  args: string[];             // Список аргументов
  redirectOut?: {             // Редирект вывода '>' или '>>'
    filePath: string;
    append: boolean;          // true для '>>', false для '>'
  };
}

// Конвейер команд (Pipe Pipeline: command1 | command2 | command3)
export interface CommandPipeline {
  commands: ParsedCommand[];
}