import { VirtualFS } from '../fs/VirtualFS';
import { PathResolver } from '../fs/PathResolver';
import { AutoCompleteContext, AutoCompleteResult, IAutoCompleter } from '../types/readline';

export class AutoCompleter implements IAutoCompleter {
  constructor(
    private fs: VirtualFS,
    private availableCommandsGetter: () => string[]
  ) {}

  public complete(context: AutoCompleteContext): AutoCompleteResult {
    const { currentInput, cursorPosition, currentPath } = context;

    const inputToCursor = currentInput.slice(0, cursorPosition);
    const tokens = inputToCursor.split(/\s+/);

    // Если мы на первом токене и в нём нет слэша — дополняем команды
    const isCommandCompletion = tokens.length <= 1 && !inputToCursor.includes('/');

    if (isCommandCompletion) {
      return this.completeCommand(tokens[0] || '', currentInput, cursorPosition);
    } else {
      const lastToken = tokens[tokens.length - 1] || '';
      return this.completePath(lastToken, currentInput, cursorPosition, currentPath);
    }
  }

  private completeCommand(
    prefix: string,
    fullInput: string,
    cursorPos: number
  ): AutoCompleteResult {
    const commands = this.availableCommandsGetter();
    const matches = commands.filter((cmd) => cmd.startsWith(prefix));

    if (matches.length === 1) {
      const completed = matches[0] + ' ';
      return {
        completedInput: completed,
        newCursorPosition: completed.length,
        matches,
      };
    }

    return {
      completedInput: fullInput,
      newCursorPosition: cursorPos,
      matches,
    };
  }

  private completePath(
    targetToken: string,
    fullInput: string,
    cursorPos: number,
    pwd: string
  ): AutoCompleteResult {
    // 1. Разбиваем токен на родительскую директорию и префикс файла/папки
    const lastSlashIndex = targetToken.lastIndexOf('/');
    let dirPath: string;
    let prefix: string;

    if (lastSlashIndex !== -1) {
      dirPath = targetToken.substring(0, lastSlashIndex);
      prefix = targetToken.substring(lastSlashIndex + 1);
      // Если dirPath пустой, значит путь начинался с корня (например, "/cat")
      if (dirPath === '') dirPath = '/';
    } else {
      dirPath = '.';
      prefix = targetToken;
    }

    // 2. Резолвим целевую директорию
    const resolvedDir = dirPath === '/' ? '/' : PathResolver.resolve(pwd, dirPath);
    const res = this.fs.resolvePath(resolvedDir, '/');

    if (!res.node || res.node.type !== 'directory') {
      return { completedInput: fullInput, newCursorPosition: cursorPos, matches: [] };
    }

    // 3. Получаем дочерние элементы и фильтруем по префиксу
    const children = this.fs.readDir(resolvedDir, '/');
    const matches = children
      .filter((child) => child.name.startsWith(prefix))
      .map((child) => ({
        name: child.name,
        isDir: child.type === 'directory',
      }));

    if (matches.length === 1) {
      const match = matches[0];
      const appendSuffix = match.isDir ? '/' : ' ';

      // Формируем новую часть токена
      const baseDir = lastSlashIndex !== -1 ? targetToken.substring(0, lastSlashIndex + 1) : '';
      const newToken = baseDir + match.name + appendSuffix;

      // Заменяем именно последний токен в строке ввода до курсора
      const lastTokenIndex = fullInput.lastIndexOf(targetToken);
      const completedInput =
        fullInput.substring(0, lastTokenIndex) +
        newToken +
        fullInput.substring(lastTokenIndex + targetToken.length);

      const newCursorPosition = lastTokenIndex + newToken.length;

      return {
        completedInput,
        newCursorPosition,
        matches: [match.name + appendSuffix],
      };
    }

    return {
      completedInput: fullInput,
      newCursorPosition: cursorPos,
      matches: matches.map((m) => m.name + (m.isDir ? '/' : '')),
    };
  }
}