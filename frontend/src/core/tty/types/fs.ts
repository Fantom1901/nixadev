// Типы элементов ФС в POSIX
export type NodeType = 'file' | 'directory' | 'symlink';

// Права доступа POSIX (чтение, запись, исполнение)
export interface Permissions {
  read: boolean;
  write: boolean;
  execute: boolean;
}

// Владелец и группа
export interface NodeOwnership {
  user: string;  // например: 'guest' или 'root'
  group: string; // например: 'guest' или 'root'
}

// Базовый интерфейс для любого элемента ФС (Inode)
export interface BaseInode {
  id: string;                 // Уникальный идентификатор Inode
  name: string;               // Имя файла или папки
  type: NodeType;             // 'file' | 'directory' | 'symlink'
  parentId: string | null;    // ID родительской директории (null для '/')
  permissions: {
    owner: Permissions;       // Права владельца
    group: Permissions;       // Права группы
    others: Permissions;      // Права остальных пользователей
  };
  owner: NodeOwnership;
  createdAt: Date;
  updatedAt: Date;
}

// Структура обычного файла
export interface FileNode extends BaseInode {
  type: 'file';
  content: string;            // Содержимое файла (текст, markdown, bash-скрипт)
  isExecutable: boolean;      // Является ли исполняемым скриптом (.sh)
}

// Структура директории (папки)
export interface DirectoryNode extends BaseInode {
  type: 'directory';
  childrenIds: string[];      // Массив ID дочерних элементов (Inode IDs)
}

// Символическая ссылка (для будущих фич)
export interface SymlinkNode extends BaseInode {
  type: 'symlink';
  targetPath: string;         // Путь, на который указывает ссылка
}

// Объединенный тип Inode
export type Inode = FileNode | DirectoryNode | SymlinkNode;

// Опции для создания новых файлов/директорий
export interface CreateNodeOptions {
  name: string;
  parentId: string;
  type: NodeType;
  content?: string;
  isExecutable?: boolean;
  owner?: NodeOwnership;
}

// Результат резолва пути
export interface PathResolveResult {
  node: Inode | null;
  absolutePath: string;
  error?: string;
}