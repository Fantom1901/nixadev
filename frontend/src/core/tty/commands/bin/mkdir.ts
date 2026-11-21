import { CommandDefinition } from '../../executor/CommandRegistry';

export const mkdirCommand: CommandDefinition = {
  name: 'mkdir',
  description: 'Создание директорий',
  execute: ({ args, fs, env }) => {
    const pwd = env.get('PWD') || '/';
    const pathArgs = args.filter((a) => !a.startsWith('-'));

    if (pathArgs.length === 0) {
      return { stdout: '', stderr: 'mkdir: missing operand\n', exitCode: 1 };
    }

    let stderr = '';
    let exitCode = 0;

    for (const targetPath of pathArgs) {
      // Вызываем mkdir(targetPath, pwd) — возвращает Inode | null
      const createdNode = fs.mkdir(targetPath, pwd);

      if (!createdNode) {
        stderr += `mkdir: cannot create directory '${targetPath}': File or directory exists or path is invalid\n`;
        exitCode = 1;
      }
    }

    return { stdout: '', stderr, exitCode };
  },
};