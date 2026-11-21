import { CommandDefinition } from '../../executor/CommandRegistry';

export const lsCommand: CommandDefinition = {
  name: 'ls',
  description: 'Вывод содержимого директории',
  execute: ({ args, fs, env }) => {
    const pwd = env.get('PWD') || '/';

    let showAll = false;
    let showLong = false;

    const pathArgs = args.filter((arg) => {
      if (arg.startsWith('-') && arg.length > 1) {
        if (arg.includes('a')) showAll = true;
        if (arg.includes('l')) showLong = true;
        return false;
      }
      return true;
    });

    const targetPath = pathArgs[0] || pwd;
    const resolved = fs.resolvePath(targetPath, pwd);

    if (!resolved.node) {
      return {
        stdout: '',
        stderr: `ls: cannot access '${targetPath}': No such file or directory\n`,
        exitCode: 2,
      };
    }

    const formatDate = (dateInput?: string | Date) => {
      const d = dateInput ? new Date(dateInput) : new Date();
      const month = d.toLocaleString('en-US', { month: 'short' });
      const day = d.getDate().toString().padStart(2, ' ');
      const time = d.toTimeString().slice(0, 5);
      return `${month} ${day} ${time}`;
    };

    const formatLongLine = (
      name: string,
      type: string,
      size: number,
      owner = 'guest',
      group = 'guest',
      mtime?: string | Date
    ) => {
      const isDir = type === 'directory';
      const isSymlink = type === 'symlink';
      const typeChar = isDir ? 'd' : isSymlink ? 'l' : '-';
      const perms = `${typeChar}rwxr-xr-x`;
      const formattedName = isDir
        ? `\x1b[34m${name}\x1b[0m`
        : isSymlink
          ? `\x1b[36m${name}\x1b[0m`
          : name;
      const dateStr = formatDate(mtime);

      return `${perms} 1 ${owner} ${group} ${size.toString().padStart(6)} ${dateStr} ${formattedName}`;
    };

    // 1. Одиночный файл или симлинк
    if (resolved.node.type !== 'directory') {
      const node = resolved.node;
      if (showLong) {
        const size = node.type === 'file' ? node.content.length : 4096;
        const line = formatLongLine(
          node.name,
          node.type,
          size,
          node.owner.user,
          node.owner.group
        );
        return { stdout: `${line}\n`, stderr: '', exitCode: 0 };
      }
      return { stdout: `${node.name}\n`, stderr: '', exitCode: 0 };
    }

    // 2. Директория
    const items = fs.readDir(targetPath, pwd);
    const resultNodes: Array<{
      name: string;
      type: string;
      size: number;
      owner: string;
      group: string;
    }> = [];

    if (showAll) {
      resultNodes.push(
        { name: '.', type: 'directory', size: 4096, owner: 'guest', group: 'guest' },
        { name: '..', type: 'directory', size: 4096, owner: 'guest', group: 'guest' }
      );
    }

    const filteredItems = showAll ? items : items.filter((item) => !item.name.startsWith('.'));

    filteredItems.forEach((item) => {
      resultNodes.push({
        name: item.name,
        type: item.type,
        size: item.type === 'file' ? item.content.length : 4096,
        owner: item.owner.user,
        group: item.owner.group,
      });
    });

    if (showLong) {
      const lines = resultNodes.map((item) =>
        formatLongLine(item.name, item.type, item.size, item.owner, item.group)
      );
      return { stdout: lines.join('\n') + (lines.length ? '\n' : ''), stderr: '', exitCode: 0 };
    }

    const formattedNames = resultNodes.map((item) => {
      if (item.type === 'directory') return `\x1b[34m${item.name}\x1b[0m`;
      if (item.type === 'symlink') return `\x1b[36m${item.name}\x1b[0m`;
      return item.name;
    });

    return { stdout: formattedNames.join('  ') + (formattedNames.length ? '\n' : ''), stderr: '', exitCode: 0 };
  },
};