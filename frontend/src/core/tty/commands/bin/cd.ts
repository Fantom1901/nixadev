import { CommandDefinition } from '../../executor/CommandRegistry';
import { PathResolver } from '../../fs/PathResolver';

export const cdCommand: CommandDefinition = {
  name: 'cd',
  description: 'Смена текущей рабочей директории',
  execute: ({ args, fs, env }) => {
    const pwd = env.get('PWD') || '/';
    const home = env.get('HOME') || '/home/guest';
    const targetPath = args[0] || home;

    const resolved = fs.resolvePath(targetPath, pwd);

    if (!resolved.node) {
      return {
        stdout: '',
        stderr: `cd: no such file or directory: ${targetPath}\n`,
        exitCode: 1,
      };
    }

    if (resolved.node.type !== 'directory') {
      return {
        stdout: '',
        stderr: `cd: not a directory: ${targetPath}\n`,
        exitCode: 1,
      };
    }

    env.set('PWD', resolved.absolutePath);
    return { stdout: '', stderr: '', exitCode: 0 };
  },
};