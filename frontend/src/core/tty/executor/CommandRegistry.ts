import { VirtualFS } from '../fs/VirtualFS';
import { Environment } from './Environment';

export interface CommandContext {
  args: string[];
  fs: VirtualFS;
  env: Environment;
  stdin?: string;
}

export interface CommandOutput {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export type CommandHandler = (ctx: CommandContext) => Promise<CommandOutput> | CommandOutput;

export interface CommandDefinition {
  name: string;
  description: string;
  execute: CommandHandler;
}

export class CommandRegistry {
  private commands: Map<string, CommandDefinition> = new Map();

  public register(command: CommandDefinition): void {
    this.commands.set(command.name, command);
  }

  public registerMany(commands: CommandDefinition[]): void {
    for (const cmd of commands) {
      this.register(cmd);
    }
  }

  public get(name: string): CommandDefinition | undefined {
    return this.commands.get(name);
  }

  public has(name: string): boolean {
    return this.commands.has(name);
  }

  public getCommandNames(): string[] {
    return Array.from(this.commands.keys());
  }

  public getAll(): CommandDefinition[] {
    return Array.from(this.commands.values());
  }
}