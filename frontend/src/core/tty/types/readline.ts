// События клавиатуры, которые перехватывает LineEditor
export type KeyAction =
  | { type: 'character'; value: string }
  | { type: 'enter' }
  | { type: 'backspace' }
  | { type: 'delete' }
  | { type: 'tab' }
  | { type: 'arrow_up' }
  | { type: 'arrow_down' }
  | { type: 'arrow_left' }
  | { type: 'arrow_right' }
  | { type: 'home' }
  | { type: 'end' }
  | { type: 'clear' }         // Ctrl+L
  | { type: 'interrupt' }     // Ctrl+C
  | { type: 'eof' }           // Ctrl+D
  | { type: 'unknown' };

// Текущее состояние строки ввода
export interface LineState {
  buffer: string;             // Вся введённая строка целиком
  cursorPosition: number;     // Индекс курсора внутри buffer (0 <= cursorPosition <= buffer.length)
}

// Интерфейс для менеджера истории команд
export interface IHistoryManager {
  add(command: string): void;
  getPrevious(currentBuffer: string): string | null;
  getNext(): string | null;
  resetIndex(): void;
  getAll(): string[];
}

// Контекст для генерации вариантов при нажатии Tab
export interface AutoCompleteContext {
  currentInput: string;       // Строка до позиции курсора
  cursorPosition: number;     // Позиция курсора
  currentPath: string;        // Текущая рабочая директория (pwd)
}

// Результат автодополнения
export interface AutoCompleteResult {
  completedInput: string;     // Обновлённая строка ввода после автодополнения
  newCursorPosition: number;  // Новое положение курсора
  matches: string[];          // Совпадения (если их несколько — для вывода списком)
}

// Интерфейс для движка автодополнения
export interface IAutoCompleter {
  complete(context: AutoCompleteContext): AutoCompleteResult;
}