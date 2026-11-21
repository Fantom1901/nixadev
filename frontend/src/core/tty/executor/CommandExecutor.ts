import { VirtualFS } from '../fs/VirtualFS';
import { Environment } from './Environment';
import { CommandRegistry } from './CommandRegistry';
import { ScriptRunner } from './ScriptRunner';
import { CommandOutput, ParsedCommand } from '../types/command';

export class CommandExecutor {
  private registry: CommandRegistry;
  private fs: VirtualFS;
  private env: Environment;
  private scriptRunner: ScriptRunner;

  constructor(registry: CommandRegistry, fs: VirtualFS, env: Environment) {
    this.registry = registry;
    this.fs = fs;
    this.env = env;
    this.scriptRunner = new ScriptRunner(this);
  }

  /**
   * Главный метод выполнения введенной строки
   */
  public async execute(rawCommandLine: string): Promise<CommandOutput> {
    const trimmed = rawCommandLine.trim();
    if (!trimmed) {
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    // Разбиваем пайплайны (компоненты разделенные '|')
    const pipeSegments = this.splitPipes(trimmed);
    let previousStdout = '';

    for (let i = 0; i < pipeSegments.length; i++) {
      const segment = pipeSegments[i];
      const parsed = this.parseCommandSegment(segment);

      if (!parsed.name) {
        continue;
      }

      // Выполняем текущий сегмент пайпа
      const res = await this.executeSingleCommand(parsed, previousStdout);

      // Если в цепочке пайпа произошла ошибка, прекращаем выполнение
      if (res.exitCode !== 0 && i < pipeSegments.length - 1) {
        return res;
      }

      previousStdout = res.stdout;

      // Если это последний сегмент и есть редирект в файл '>' или '>>'
      if (i === pipeSegments.length - 1 && parsed.redirectOut) {
        const pwd = this.env.get('PWD') || '/';
        const targetFile = parsed.redirectOut.filePath;

        if (parsed.redirectOut.append) {
          const existingContent = this.fs.readFile(targetFile, pwd) || '';
          this.fs.writeFile(targetFile, existingContent + res.stdout, pwd);
        } else {
          this.fs.writeFile(targetFile, res.stdout, pwd);
        }

        // При редиректе stdout не выводится в TTY
        return { stdout: '', stderr: res.stderr, exitCode: res.exitCode };
      }

      if (i === pipeSegments.length - 1) {
        return res;
      }
    }

    return { stdout: previousStdout, stderr: '', exitCode: 0 };
  }

  /**
   * Запуск одиночной команды
   */
  private async executeSingleCommand(
    parsed: ParsedCommand,
    stdin: string
  ): Promise<CommandOutput> {
    const { name, args } = parsed;
    const pwd = this.env.get('PWD') || '/';

    // 1. Проверяем, зарегистрирована ли утилита в /bin или встроенных командах
    const command = this.registry.get(name);
    if (command) {
      try {
        const output = await command.execute({
          args,
          env: this.env,
          fs: this.fs,
          stdin,
        });

        return output;
      } catch (err: any) {
        return { stdout: '', stderr: `${name}: execution error: ${err.message}\n`, exitCode: 1 };
      }
    }

    // 2. Проверяем, является ли это запуском скрипта (например, ./script.sh или /home/guest/welcome.sh)
    const fileRes = this.fs.resolvePath(name, pwd);
    if (fileRes.node && fileRes.node.type === 'file') {
      if (!fileRes.node.isExecutable) {
        return { stdout: '', stderr: `${name}: Permission denied\n`, exitCode: 126 };
      }
      return this.scriptRunner.runScript(fileRes.node.content);
    }

    return { stdout: '', stderr: `${name}: command not found\n`, exitCode: 127 };
  }

  /**
   * Разбор сегментов пайпа '|' с уходом от символов внутри кавычек
   */
  private splitPipes(input: string): string[] {
    const segments: string[] = [];
    let current = '';
    let inSingleQuote = false;
    let inDoubleQuote = false;

    for (let i = 0; i < input.length; i++) {
      const char = input[i];

      if (char === "'" && !inDoubleQuote) {
        inSingleQuote = !inSingleQuote;
        current += char;
      } else if (char === '"' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote;
        current += char;
      } else if (char === '|' && !inSingleQuote && !inDoubleQuote) {
        segments.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    if (current) {
      segments.push(current);
    }

    return segments;
  }

  /**
   * Токенизация команды, раскрытие $ENV, поиск редиректов '>' / '>>'
   */
  private parseCommandSegment(segment: string): ParsedCommand {
    const tokens: string[] = [];
    let currentToken = '';
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let redirectOut: ParsedCommand['redirectOut'];

    const raw = segment.trim();

    for (let i = 0; i < raw.length; i++) {
      const char = raw[i];

      if (char === "'" && !inDoubleQuote) {
        inSingleQuote = !inSingleQuote;
        continue;
      }
      if (char === '"' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote;
        continue;
      }

      if (/\s/.test(char) && !inSingleQuote && !inDoubleQuote) {
        if (currentToken) {
          tokens.push(currentToken);
          currentToken = '';
        }
        continue;
      }

      // Проверка на символы редиректа '>' и '>>'
      if (char === '>' && !inSingleQuote && !inDoubleQuote) {
        if (currentToken) {
          tokens.push(currentToken);
          currentToken = '';
        }

        const isAppend = raw[i + 1] === '>';
        if (isAppend) i++;

        const targetFileRaw = raw.substring(i + 1).trim();
        const targetTokens = targetFileRaw.split(/\s+/);

        if (targetTokens[0]) {
          redirectOut = {
            filePath: this.env.expand(targetTokens[0]),
            append: isAppend,
          };
        }
        break; // Все, что после '>', относится к пути файла
      }

      currentToken += char;
    }

    if (currentToken) {
      tokens.push(currentToken);
    }

    if (tokens.length === 0) {
      return { name: '', args: [] };
    }

    // Раскрываем переменные окружения ($VAR) во всех аргументах, кроме одинарных кавычек
    const expandedTokens = tokens.map((token) => this.env.expand(token));

    return {
      name: expandedTokens[0],
      args: expandedTokens.slice(1),
      redirectOut,
    };
  }
}