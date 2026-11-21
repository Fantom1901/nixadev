import { Terminal } from '@xterm/xterm';
import { VirtualFS } from '@/core/tty/fs/VirtualFS';
import { populateInitialFs } from '@/core/tty/fs/initialFsTree';
import { Environment } from '@/core/tty/executor/Environment';
import { CommandRegistry } from '@/core/tty/executor/CommandRegistry';
import { CommandExecutor } from '@/core/tty/executor/CommandExecutor';
import { HistoryManager } from '@/core/tty/readline/HistoryManager';
import { AutoCompleter } from '@/core/tty/readline/AutoCompleter';
import { LineEditor } from '@/core/tty/readline/LineEditor';
import { SystemdBootAnimation } from '@/components/tty/SystemdBootAnimation';
import { builtinCommands } from '@/core/tty/commands';

export class TTYEngine {
  private term: Terminal;
  private fs: VirtualFS;
  private env: Environment;
  private registry: CommandRegistry;
  private executor: CommandExecutor;
  private history: HistoryManager;
  private autoCompleter: AutoCompleter;
  private lineEditor: LineEditor;
  private isExecuting: boolean = false;

  constructor(term: Terminal) {
    this.term = term;

    // 1. Инициализация VFS и первичного дерева файлов
    this.fs = new VirtualFS();
    populateInitialFs(this.fs);

    // 2. Инициализация окружения
    this.env = new Environment({
      USER: 'guest',
      HOME: '/home/guest',
      PWD: '/home/guest',
      HOSTNAME: 'portfolio-tty',
    });

    // 3. Реестр команд и запись базовых утилит
    this.registry = new CommandRegistry();
    this.registerDefaultCommands();

    // 4. Исполнитель команд
    this.executor = new CommandExecutor(this.registry, this.fs, this.env);

    // 5. Readline слой (История, Tab-дополнение, Редактор строки)
    this.history = new HistoryManager(100);
    this.autoCompleter = new AutoCompleter(this.fs, () => this.registry.getCommandNames());
    this.lineEditor = new LineEditor(this.term, this.history, this.autoCompleter);

    this.updatePrompt();
  }

  /**
   * Запуск TTY-движка: сначала системная анимация, затем ввод
   */
  public async start(): Promise<void> {
    // 1. Блокируем ввод на время загрузки
    this.isExecuting = true;

    // 2. Проигрываем анимацию systemd
    const bootAnimation = new SystemdBootAnimation(this.term);
    await bootAnimation.run();

    // 3. Вывод приветственного сообщения из /etc/motd
    const motd = this.fs.readFile('/etc/motd');
    if (motd) {
      this.writeFormattedText(motd);
      if (!motd.endsWith('\n')) {
        this.term.write('\r\n');
      }
    }

    // 4. Отрисовка рабочего промпта и разблокировка ввода
    this.isExecuting = false;
    this.lineEditor.printPrompt();

    // 5. Главный слушатель ввода с клавиатуры от xterm.js
    this.term.onData(async (data) => {
      if (this.isExecuting) return; // Блокировка ввода во время выполнения асинхронных команд

      const pwd = this.env.get('PWD') || '/home/guest';
      const result = this.lineEditor.handleData(data, pwd);

      if (result.type === 'submit' && result.command !== undefined) {
        await this.handleCommandSubmit(result.command);
      }
    });
  }

  /**
   * Обработка отправленной пользователем команды
   */
  private async handleCommandSubmit(commandLine: string): Promise<void> {
    this.isExecuting = true;

    try {
      const output = await this.executor.execute(commandLine);

      if (output.stdout) {
        this.writeFormattedText(output.stdout);
        // Если вывод stdout не заканчивается переносом строки, добавляем его
        if (!output.stdout.endsWith('\n')) {
          this.term.write('\r\n');
        }
      }

      if (output.stderr) {
        // Подсвечиваем stderr красным и ОБЯЗАТЕЛЬНО форматируем \n в \r\n
        const formattedStderr = output.stderr.replace(/\r?\n/g, '\r\n');
        this.term.write(`\x1b[31m${formattedStderr}\x1b[0m`);

        // Гарантируем перенос каретки в начало следующей строки
        if (!output.stderr.endsWith('\n')) {
          this.term.write('\r\n');
        }
      }
    } catch (err: any) {
      const formattedErr = `Internal TTY Error: ${err.message}`.replace(/\r?\n/g, '\r\n');
      this.term.write(`\x1b[31m${formattedErr}\x1b[0m\r\n`);
    } finally {
      this.isExecuting = false;
      this.updatePrompt();
      this.lineEditor.printPrompt();
    }
  }

  /**
   * Обновление строки приглашения (Prompt: user@hostname:path$)
   */
  private updatePrompt(): void {
    const user = this.env.get('USER') || 'guest';
    const hostname = this.env.get('HOSTNAME') || 'tty';
    let pwd = this.env.get('PWD') || '/';
    const home = this.env.get('HOME') || '/home/guest';

    // Замена пути домашней директории на ~
    if (pwd === home) {
      pwd = '~';
    } else if (pwd.startsWith(home + '/')) {
      pwd = pwd.replace(home, '~');
    }

    // Зеленый user@hostname, синий pwd
    const prompt = `\x1b[32m${user}@${hostname}\x1b[0m:\x1b[34m${pwd}\x1b[0m$ `;
    this.lineEditor.setPrompt(prompt);
  }

  /**
   * Корректный вывод текста с поддержкой переноса \n в CRLF (\r\n) для xterm
   */
  private writeFormattedText(text: string): void {
    const formatted = text.replace(/\r?\n/g, '\r\n');
    this.term.write(formatted);
  }

  /**
   * Регистрация базового набора утилит
   */
  private registerDefaultCommands(): void {
    this.registry.registerMany(builtinCommands);
  }
}