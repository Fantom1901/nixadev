import { CommandExecutor } from './CommandExecutor';
import { CommandOutput } from '../types/command';

export class ScriptRunner {
  constructor(private executor: CommandExecutor) {}

  /**
   * Запускает bash/sh скрипт строка за строкой
   */
  public async runScript(scriptContent: string): Promise<CommandOutput> {
    const lines = scriptContent.split('\n');
    let combinedStdout = '';
    let combinedStderr = '';
    let lastExitCode = 0;

    for (const line of lines) {
      const trimmed = line.trim();

      // Игнорируем пустые строки и комментарии (включая shebang #!)
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const result = await this.executor.execute(trimmed);

      if (result.stdout) {
        combinedStdout += result.stdout;
      }

      if (result.stderr) {
        combinedStderr += result.stderr;
      }

      lastExitCode = result.exitCode;

      // В случае ошибки прекращаем выполнение скрипта (set -e поведение)
      if (lastExitCode !== 0) {
        break;
      }
    }

    return {
      stdout: combinedStdout,
      stderr: combinedStderr,
      exitCode: lastExitCode,
    };
  }
}