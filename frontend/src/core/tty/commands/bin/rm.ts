import { CommandDefinition } from '../../executor/CommandRegistry';

export const rmCommand: CommandDefinition = {
  name: 'rm',
  description: 'Удаление файлов или директорий',
  execute: ({ args, fs, env }) => {
    const pwd = env.get('PWD') || '/';
    const recursive = args.includes('-r') || args.includes('-R') || args.includes('-rf') || args.includes('-fr');
    const force = args.includes('-f') || args.includes('-rf') || args.includes('-fr');
    const pathArgs = args.filter((a) => !a.startsWith('-'));

    if (pathArgs.length === 0) {
      if (force) return { stdout: '', stderr: '', exitCode: 0 };
      return { stdout: '', stderr: 'rm: missing operand\n', exitCode: 1 };
    }

    let stderr = '';
    let exitCode = 0;

    for (const targetPath of pathArgs) {
      const resolved = fs.resolvePath(targetPath, pwd);

      if (!resolved.node) {
        if (!force) {
          stderr += `rm: cannot remove '${targetPath}': No such file or directory\n`;
          exitCode = 1;
        }
        continue;
      }

      if (resolved.node.type === 'directory' && !recursive) {
        stderr += `rm: cannot remove '${targetPath}': Is a directory\n`;
        exitCode = 1;
        continue;
      }

      const success = fs.deleteNode(targetPath, pwd);
      if (!success && !force) {
        stderr += `rm: cannot remove '${targetPath}': Failed to remove\n`;
        exitCode = 1;
      }
    }

    return { stdout: '', stderr, exitCode };
  },
};