import { Terminal } from '@xterm/xterm';
import { HistoryManager } from './HistoryManager';
import { AutoCompleter } from './AutoCompleter';
import { KeyAction, LineState } from '../types/readline';

export class LineEditor {
  private buffer: string = '';
  private cursorPosition: number = 0;
  private history: HistoryManager;
  private autoCompleter: AutoCompleter;
  private promptString: string = '$ ';

  constructor(
    private term: Terminal,
    historyManager: HistoryManager,
    autoCompleter: AutoCompleter
  ) {
    this.history = historyManager;
    this.autoCompleter = autoCompleter;
  }

  public setPrompt(prompt: string): void {
    this.promptString = prompt;
  }

  public printPrompt(): void {
    this.term.write(this.promptString);
  }

  public getState(): LineState {
    return {
      buffer: this.buffer,
      cursorPosition: this.cursorPosition,
    };
  }

  public clearLine(): void {
    // Возвращаем курсор в начало строки после prompt
    while (this.cursorPosition > 0) {
      this.term.write('\b \b');
      this.cursorPosition--;
    }
    // Стираем остаток текста справа, если курсор был не в конце
    this.term.write('\x1b[K');
    this.buffer = '';
  }

  /**
   * Разбор сырых байт от xterm.onData() в структурированное действие
   */
  public parseKeyAction(data: string): KeyAction {
    if (data === '\r' || data === '\n') return { type: 'enter' };
    if (data === '\x7f' || data === '\x08') return { type: 'backspace' };
    if (data === '\t') return { type: 'tab' };
    if (data === '\x03') return { type: 'interrupt' }; // Ctrl+C
    if (data === '\x0c') return { type: 'clear' };     // Ctrl+L
    if (data === '\x04') return { type: 'eof' };       // Ctrl+D

    // Escape-последовательности стрелок и спецклавиш
    if (data === '\x1b[A') return { type: 'arrow_up' };
    if (data === '\x1b[B') return { type: 'arrow_down' };
    if (data === '\x1b[C') return { type: 'arrow_right' };
    if (data === '\x1b[D') return { type: 'arrow_left' };
    if (data === '\x1b[H' || data === '\x1b[1~') return { type: 'home' };
    if (data === '\x1b[F' || data === '\x1b[4~') return { type: 'end' };
    if (data === '\x1b[3~') return { type: 'delete' };

    // Обычный печатаемый символ
    if (data.length === 1 && data.charCodeAt(0) >= 32) {
      return { type: 'character', value: data };
    }

    return { type: 'unknown' };
  }

  /**
   * Главный обработчик ввода символов
   */
  public handleData(data: string, currentPwd: string): { type: 'submit' | 'handled'; command?: string } {
    const action = this.parseKeyAction(data);

    switch (action.type) {
      case 'enter': {
        const command = this.buffer;
        this.term.write('\r\n');
        if (command.trim()) {
          this.history.add(command);
        }
        this.buffer = '';
        this.cursorPosition = 0;
        return { type: 'submit', command };
      }

      case 'character': {
        this.insertCharacter(action.value);
        return { type: 'handled' };
      }

      case 'backspace': {
        this.handleBackspace();
        return { type: 'handled' };
      }

      case 'delete': {
        this.handleDelete();
        return { type: 'handled' };
      }

      case 'arrow_left': {
        if (this.cursorPosition > 0) {
          this.cursorPosition--;
          this.term.write('\x1b[D');
        }
        return { type: 'handled' };
      }

      case 'arrow_right': {
        if (this.cursorPosition < this.buffer.length) {
          this.cursorPosition++;
          this.term.write('\x1b[C');
        }
        return { type: 'handled' };
      }

      case 'arrow_up': {
        const prev = this.history.getPrevious(this.buffer);
        if (prev !== null) {
          this.replaceBuffer(prev);
        }
        return { type: 'handled' };
      }

      case 'arrow_down': {
        const next = this.history.getNext();
        if (next !== null) {
          this.replaceBuffer(next);
        }
        return { type: 'handled' };
      }

      case 'home': {
        if (this.cursorPosition > 0) {
          this.term.write(`\x1b[${this.cursorPosition}D`);
          this.cursorPosition = 0;
        }
        return { type: 'handled' };
      }

      case 'end': {
        const diff = this.buffer.length - this.cursorPosition;
        if (diff > 0) {
          this.term.write(`\x1b[${diff}C`);
          this.cursorPosition = this.buffer.length;
        }
        return { type: 'handled' };
      }

      case 'tab': {
        this.handleTab(currentPwd);
        return { type: 'handled' };
      }

      case 'interrupt': {
        this.term.write('^C\r\n');
        this.buffer = '';
        this.cursorPosition = 0;
        this.history.resetIndex();
        this.printPrompt();
        return { type: 'handled' };
      }

      case 'clear': {
        this.term.clear();
        this.printPrompt();
        this.term.write(this.buffer);
        if (this.buffer.length - this.cursorPosition > 0) {
          this.term.write(`\x1b[${this.buffer.length - this.cursorPosition}D`);
        }
        return { type: 'handled' };
      }

      default:
        return { type: 'handled' };
    }
  }

  private insertCharacter(char: string): void {
    if (this.cursorPosition === this.buffer.length) {
      this.buffer += char;
      this.cursorPosition++;
      this.term.write(char);
    } else {
      // Вставка в середину строки
      const left = this.buffer.slice(0, this.cursorPosition);
      const right = this.buffer.slice(this.cursorPosition);
      this.buffer = left + char + right;
      this.cursorPosition++;

      // Отрисовываем обновлённый хвост строки и возвращаем курсор на место
      const remainder = char + right;
      this.term.write(remainder);
      this.term.write(`\x1b[${right.length}D`);
    }
  }

  private handleBackspace(): void {
    if (this.cursorPosition === 0) return;

    const left = this.buffer.slice(0, this.cursorPosition - 1);
    const right = this.buffer.slice(this.cursorPosition);
    this.buffer = left + right;
    this.cursorPosition--;

    this.term.write('\b \b');
    if (right.length > 0) {
      this.term.write(right + ' ');
      this.term.write(`\x1b[${right.length + 1}D`);
    }
  }

  private handleDelete(): void {
    if (this.cursorPosition >= this.buffer.length) return;

    const left = this.buffer.slice(0, this.cursorPosition);
    const right = this.buffer.slice(this.cursorPosition + 1);
    this.buffer = left + right;

    this.term.write(right + ' ');
    this.term.write(`\x1b[${right.length + 1}D`);
  }

  private handleTab(currentPwd: string): void {
    const result = this.autoCompleter.complete({
      currentInput: this.buffer,
      cursorPosition: this.cursorPosition,
      currentPath: currentPwd,
    });

    if (result.matches.length > 1) {
      // Если совпадений несколько — выводим список на новой строке
      this.term.write('\r\n');
      this.term.writeln(result.matches.join('  '));
      this.printPrompt();
      this.term.write(this.buffer);
      if (this.buffer.length - this.cursorPosition > 0) {
        this.term.write(`\x1b[${this.buffer.length - this.cursorPosition}D`);
      }
    } else if (result.matches.length === 1) {
      this.replaceBuffer(result.completedInput);
    }
  }

  private replaceBuffer(newBuffer: string): void {
    this.clearLine();
    this.buffer = newBuffer;
    this.cursorPosition = newBuffer.length;
    this.term.write(this.buffer);
  }
}