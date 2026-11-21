export class PathResolver {
  /**
   * Нормализует путь, разворачивая '.' и '..'
   */
  public static normalize(path: string): string {
    if (!path || path === '.') return '/';

    const segments = path.split('/').filter(Boolean);
    const stack: string[] = [];

    for (const segment of segments) {
      if (segment === '.') continue;
      if (segment === '..') {
        stack.pop();
      } else {
        stack.push(segment);
      }
    }

    return '/' + stack.join('/');
  }

  /**
   * Соединяет текущий $PWD и указанный targetPath
   */
  public static resolve(currentWorkingDir: string, targetPath: string, homeDir: string = '/home/guest'): string {
    let cleanPath = targetPath.trim();

    // Разворот тильды ~
    if (cleanPath === '~' || cleanPath.startsWith('~/')) {
      cleanPath = cleanPath.replace('~', homeDir);
    }

    // Если путь относительный
    if (!cleanPath.startsWith('/')) {
      cleanPath = `${currentWorkingDir}/${cleanPath}`;
    }

    return this.normalize(cleanPath);
  }

  /**
   * Разбивает путь на родительскую директорию и имя файла/папки
   */
  public static splitPath(absolutePath: string): { parentPath: string; name: string } {
    const normalized = this.normalize(absolutePath);
    if (normalized === '/') {
      return { parentPath: '/', name: '' };
    }

    const lastSlashIndex = normalized.lastIndexOf('/');
    const parentPath = normalized.substring(0, lastSlashIndex) || '/';
    const name = normalized.substring(lastSlashIndex + 1);

    return { parentPath, name };
  }
}