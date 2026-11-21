import { CommandDefinition } from '../../executor/CommandRegistry';

export const chmodCommand: CommandDefinition = {
  name: 'chmod',
  description: 'Изменение прав доступа',
  execute: ({ args, fs, env }) => {
    const pwd = env.get('PWD') || '/';

    if (args.length < 2) {
      return {
        stdout: '',
        stderr: 'chmod: missing operand\nUsage: chmod <mode> <file>\n',
        exitCode: 1,
      };
    }

    const modeStr = args[0];
    const targetPath = args[1];

    const resolved = fs.resolvePath(targetPath, pwd);
    if (!resolved.node) {
      return {
        stdout: '',
        stderr: `chmod: cannot access '${targetPath}': No such file or directory\n`,
        exitCode: 1,
      };
    }

    const node = resolved.node;

    // Обработка +x / -x или восьмеричных прав (например, 755 / 644)
    if (modeStr.includes('x')) {
      const enable = !modeStr.startsWith('-');
      node.permissions.owner.execute = enable;
      node.permissions.group.execute = enable;
      node.permissions.others.execute = enable;
    } else if (/^[0-7]{3,4}$/.test(modeStr)) {
      const octal = parseInt(modeStr.slice(-3), 8);
      const read = Boolean(octal & 4);
      const write = Boolean(octal & 2);
      const execute = Boolean(octal & 1);

      node.permissions.owner = { read, write, execute };
      node.permissions.group = { read, write, execute };
      node.permissions.others = { read, write, execute };
    }

    return { stdout: '', stderr: '', exitCode: 0 };
  },
};