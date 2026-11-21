import { VirtualFS } from './VirtualFS';

export function populateInitialFs(fs: VirtualFS): void {
  // 1. Базовые системные директории POSIX
  fs.mkdir('/bin');
  fs.mkdir('/etc');
  fs.mkdir('/home');
  fs.mkdir('/home/guest');
  fs.mkdir('/home/guest/projects');
  fs.mkdir('/var');
  fs.mkdir('/tmp');

  // 2. Системные конфигурационные файлы
  fs.writeFile(
    '/etc/hostname',
    'portfolio-tty\n'
  );

  fs.writeFile(
    '/etc/motd',
    'Welcome to Portfolio TTY System v1.0.0 (POSIX-emulated xterm.js)\nType "help" or "ls" to explore.\n'
  );

  // 3. Файлы портфолио в домашней директории
  fs.writeFile(
    '/home/guest/about.md',
    '# Обо мне\n\nFull-stack разработчик. Специализируюсь на React, Next.js, TypeScript и системных веб-решениях.\n'
  );

  fs.writeFile(
    '/home/guest/contacts.txt',
    'Email: dev@example.com\nGitHub: https://github.com\nTelegram: @username\n'
  );

  // 4. Пример проектов
  fs.writeFile(
    '/home/guest/projects/tty-simulator.md',
    '# Web TTY Simulator\n\nИнтерактивный эмулятор POSIX-терминала на TypeScript + xterm.js для Next.js.\n'
  );

  // 5. Пример скрипта (.sh)
  fs.writeFile(
    '/home/guest/welcome.sh',
    '#!/bin/sh\necho "=== SYSTEM STATUS ==="\necho "User: $USER"\necho "Directory: $PWD"\necho "All systems operational."\n',
    '/',
    true // isExecutable = true
  );
}