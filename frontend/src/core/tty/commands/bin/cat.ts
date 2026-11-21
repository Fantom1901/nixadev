import { CommandDefinition } from '../../executor/CommandRegistry';

export const catCommand: CommandDefinition = {
  name: 'cat',
  description: 'Вывод содержимого файла',
  execute: ({ args, fs, env }) => {
    const pwd = env.get('PWD') || '/';
    const pathArgs = args.filter((a) => !a.startsWith('-'));

    if (pathArgs.length === 0) {
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    let stdout = '';
    let stderr = '';
    let exitCode = 0;

    for (const targetPath of pathArgs) {
      const result = fs.readFile(targetPath, pwd);

      if (result === null) {
        stderr += `cat: ${targetPath}: No such file or directory\n`;
        exitCode = 1;
      } else {
        stdout += result;
      }
    }

    return { stdout, stderr, exitCode };
  },
};