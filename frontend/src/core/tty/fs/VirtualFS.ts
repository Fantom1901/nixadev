import { Inode, DirectoryNode, FileNode, PathResolveResult } from '../types/fs';
import { PathResolver } from './PathResolver';
import { InodeFactory } from './Inode';

export class VirtualFS {
  private inodes: Record<string, Inode> = {};
  private rootId: string = 'root_node';
  private pathToIdMap: Record<string, string> = {};

  constructor() {
    this.initRoot();
  }

  private initRoot() {
    const root = InodeFactory.createDirectory(this.rootId, '/', null, { user: 'root', group: 'root' });
    this.inodes[this.rootId] = root;
    this.pathToIdMap['/'] = this.rootId;
  }

  /**
   * Находит Inode по абсолютному или относительному пути
   */
  public resolvePath(targetPath: string, pwd: string = '/'): PathResolveResult {
    const absolutePath = PathResolver.resolve(pwd, targetPath);
    const nodeId = this.pathToIdMap[absolutePath];

    if (!nodeId || !this.inodes[nodeId]) {
      return { node: null, absolutePath, error: `No such file or directory: ${targetPath}` };
    }

    return { node: this.inodes[nodeId], absolutePath };
  }

  /**
   * Создание директории (аналог mkdir -p)
   */
  public mkdir(targetPath: string, pwd: string = '/'): Inode | null {
    const absolutePath = PathResolver.resolve(pwd, targetPath);
    if (this.pathToIdMap[absolutePath]) return null; // Ужe существует

    const { parentPath, name } = PathResolver.splitPath(absolutePath);
    const parentResult = this.resolvePath(parentPath, '/');

    if (!parentResult.node || parentResult.node.type !== 'directory') {
      return null;
    }

    const parentNode = parentResult.node as DirectoryNode;
    const newId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newDir = InodeFactory.createDirectory(newId, name, parentNode.id);

    this.inodes[newId] = newDir;
    parentNode.childrenIds.push(newId);
    this.pathToIdMap[absolutePath] = newId;

    return newDir;
  }

  /**
   * Удаление файла или директории
   */
  public deleteNode(targetPath: string, pwd: string = '/'): boolean {
    const resolved = this.resolvePath(targetPath, pwd);
    if (!resolved.node) return false;

    const node = resolved.node;
    if (node.id === this.rootId) return false; // Запрет на удаление корня

    // 1. Рекурсивное удаление детей, если это директория
    if (node.type === 'directory') {
      const dirNode = node as DirectoryNode;
      const childrenIds = [...dirNode.childrenIds];
      for (const childId of childrenIds) {
        const childNode = this.inodes[childId];
        if (childNode) {
          const childPath = `${resolved.absolutePath === '/' ? '' : resolved.absolutePath}/${childNode.name}`;
          this.deleteNode(childPath, '/');
        }
      }
    }

    // 2. Удаление ссылки у родительской директории
    if (node.parentId && this.inodes[node.parentId]) {
      const parentDir = this.inodes[node.parentId] as DirectoryNode;
      parentDir.childrenIds = parentDir.childrenIds.filter((id) => id !== node.id);
    }

    // 3. Очистка из таблицы inodes и маппинга путей
    delete this.inodes[node.id];
    delete this.pathToIdMap[resolved.absolutePath];

    return true;
  }

  /**
   * Создание или перезапись файла (touch / echo > file)
   */
  public writeFile(targetPath: string, content: string, pwd: string = '/', isExecutable: boolean = false): FileNode | null {
    const absolutePath = PathResolver.resolve(pwd, targetPath);
    const existing = this.resolvePath(absolutePath, '/');

    if (existing.node) {
      if (existing.node.type === 'directory') return null;
      const file = existing.node as FileNode;
      file.content = content;
      file.updatedAt = new Date();
      return file;
    }

    const { parentPath, name } = PathResolver.splitPath(absolutePath);
    const parentResult = this.resolvePath(parentPath, '/');

    if (!parentResult.node || parentResult.node.type !== 'directory') {
      return null;
    }

    const parentNode = parentResult.node as DirectoryNode;
    const newId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newFile = InodeFactory.createFile(newId, name, parentNode.id, content, isExecutable);

    this.inodes[newId] = newFile;
    parentNode.childrenIds.push(newId);
    this.pathToIdMap[absolutePath] = newId;

    return newFile;
  }

  /**
   * Чтение содержимого папки для ls
   */
  public readDir(targetPath: string, pwd: string = '/'): Inode[] {
    const res = this.resolvePath(targetPath, pwd);
    if (!res.node || res.node.type !== 'directory') return [];

    const dir = res.node as DirectoryNode;
    return dir.childrenIds.map((id) => this.inodes[id]).filter(Boolean);
  }

  /**
   * Чтение содержимого файла для cat
   */
  public readFile(targetPath: string, pwd: string = '/'): string | null {
    const res = this.resolvePath(targetPath, pwd);
    if (!res.node || res.node.type !== 'file') return null;
    return (res.node as FileNode).content;
  }
}