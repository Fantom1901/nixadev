export interface EnvironmentVariables {
  [key: string]: string;
}

export class Environment {
  private variables: Map<string, string> = new Map();

  constructor(initialVars?: EnvironmentVariables) {
    // Дефолтные значения окружения POSIX-подобной системы
    const defaults: EnvironmentVariables = {
      USER: 'guest',
      HOME: '/home/guest',
      PWD: '/home/guest',
      SHELL: '/bin/sh',
      PATH: '/bin:/usr/bin',
      TERM: 'xterm-256color',
      TERM_PROGRAM: 'web-terminal',
    };

    const merged = { ...defaults, ...initialVars };
    Object.entries(merged).forEach(([key, value]) => {
      this.variables.set(key, value);
    });
  }

  public get(key: string): string | undefined {
    return this.variables.get(key);
  }

  public set(key: string, value: string): void {
    this.variables.set(key, value);
  }

  public unset(key: string): boolean {
    return this.variables.delete(key);
  }

  public has(key: string): boolean {
    return this.variables.has(key);
  }

  public getAll(): EnvironmentVariables {
    const result: EnvironmentVariables = {};
    this.variables.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /**
   * Подстановка переменных окружения в строку.
   * Поддерживает форматы: $VAR и ${VAR}
   */
  public expand(input: string): string {
    // Замена ${VAR}
    let expanded = input.replace(/\$\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, (_, varName) => {
      return this.variables.get(varName) ?? '';
    });

    // Замена $VAR
    expanded = expanded.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, varName) => {
      return this.variables.get(varName) ?? '';
    });

    return expanded;
  }

  /**
   * Создает изолированную копию окружения
   */
  public clone(): Environment {
    return new Environment(this.getAll());
  }
}