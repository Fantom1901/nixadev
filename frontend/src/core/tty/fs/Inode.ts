import { DirectoryNode, FileNode, NodeOwnership, Permissions } from '../types/fs';

export const DEFAULT_PERMISSIONS: { owner: Permissions; group: Permissions; others: Permissions } = {
  owner: { read: true, write: true, execute: true },
  group: { read: true, write: false, execute: true },
  others: { read: true, write: false, execute: true },
};

export const DEFAULT_OWNERSHIP: NodeOwnership = {
  user: 'guest',
  group: 'guest',
};

export class InodeFactory {
  public static createDirectory(
    id: string,
    name: string,
    parentId: string | null,
    owner = DEFAULT_OWNERSHIP
  ): DirectoryNode {
    return {
      id,
      name,
      type: 'directory',
      parentId,
      childrenIds: [],
      permissions: DEFAULT_PERMISSIONS,
      owner,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  public static createFile(
    id: string,
    name: string,
    parentId: string,
    content: string = '',
    isExecutable: boolean = false,
    owner = DEFAULT_OWNERSHIP
  ): FileNode {
    return {
      id,
      name,
      type: 'file',
      parentId,
      content,
      isExecutable,
      permissions: {
        ...DEFAULT_PERMISSIONS,
        owner: { ...DEFAULT_PERMISSIONS.owner, execute: isExecutable },
      },
      owner,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}