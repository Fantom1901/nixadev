import { IHistoryManager } from '../types/readline';

export class HistoryManager implements IHistoryManager {
  private history: string[] = [];
  private historyIndex: number = -1;
  private currentDraft: string = '';
  private maxHistorySize: number;

  constructor(maxHistorySize: number = 100) {
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * Добавляет команду в историю (игнорирует пустые и дубликаты подряд)
   */
  public add(command: string): void {
    const trimmed = command.trim();
    if (!trimmed) return;

    // Не добавляем подряд две одинаковые команды
    if (this.history.length > 0 && this.history[this.history.length - 1] === trimmed) {
      this.resetIndex();
      return;
    }

    this.history.push(trimmed);

    // Ограничиваем размер истории
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }

    this.resetIndex();
  }

  /**
   * Нажатие стрелки ВВЕРХ
   */
  public getPrevious(currentBuffer: string): string | null {
    if (this.history.length === 0) return null;

    // Если только начали листать историю — сохраняем текущий черновик
    if (this.historyIndex === -1) {
      this.currentDraft = currentBuffer;
      this.historyIndex = this.history.length - 1;
    } else if (this.historyIndex > 0) {
      this.historyIndex--;
    } else {
      // Упёрлись в самое начало истории
      return this.history[0];
    }

    return this.history[this.historyIndex];
  }

  /**
   * Нажатие стрелки ВНИЗ
   */
  public getNext(): string | null {
    if (this.historyIndex === -1) return null;

    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      return this.history[this.historyIndex];
    }

    // Дошли до самого низа — возвращаем сохранённый черновик
    this.resetIndex();
    return this.currentDraft;
  }

  /**
   * Сброс индекса навигации (например, при нажатии Enter или ввода новой команды)
   */
  public resetIndex(): void {
    this.historyIndex = -1;
    this.currentDraft = '';
  }

  /**
   * Возвращает всю историю (для команды 'history')
   */
  public getAll(): string[] {
    return [...this.history];
  }
}