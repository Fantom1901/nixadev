'use client';

import dynamic from 'next/dynamic';

const Terminal = dynamic(() => import('@/components/tty/Terminal'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#0d0714] font-mono text-xs text-purple-400">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500/20 border-t-purple-400" />
      <span>INITIALIZING NIXADEV TTY...</span>
    </div>
  ),
});

export default function TTYPage() {
  return (
    <main className="flex h-screen w-screen overflow-hidden bg-[#07040a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(168,85,247,0.15),rgba(0,0,0,0))] p-2 sm:p-4 md:p-6 2xl:p-10">
      {/* Кастомное окно терминала nixaDev */}
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-purple-500/20 bg-[#0d0714]/90 shadow-[0_0_60px_rgba(168,85,247,0.12)] backdrop-blur-2xl">

        {/* Фирменный кастомный бар (без macOS кнопок) */}
        <div className="flex h-10 2xl:h-12 min-h-[40px] items-center justify-between border-b border-purple-500/15 bg-[#130b1e]/80 px-4 2xl:px-6 select-none">

          {/* Левая часть: Брендинг nixaDev */}
          <div className="flex items-center gap-2.5 font-mono">
            <span className="flex h-2 w-2 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 shadow-[0_0_8px_rgba(232,121,249,0.8)]" />
            <span className="text-xs 2xl:text-sm font-bold tracking-wide bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
              nixaDev
            </span>
            <span className="text-slate-600 text-xs">/</span>
            <span className="text-[11px] 2xl:text-xs text-slate-400 font-medium">terminal</span>
          </div>

          {/* Центр: Данные сессии */}
          <div className="flex items-center gap-2 font-mono text-xs 2xl:text-sm text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-pink-500" />
            </span>
            <span className="text-purple-300 font-medium">nixa@archlinux</span>
            <span className="text-slate-600">:</span>
            <span className="text-slate-400">~</span>
          </div>

          {/* Правая часть: Виджет статуса */}
          <div className="flex items-center gap-3 font-mono text-[11px] 2xl:text-xs text-slate-400">
            <span className="hidden sm:inline-block rounded-md border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[10px] 2xl:text-[11px] font-medium text-pink-300">
              POSIX TTY
            </span>
            <span className="text-slate-400">v6.0</span>
          </div>
        </div>

        {/* Контейнер Canvas */}
        <div className="relative flex-1 w-full h-full overflow-hidden">
          <Terminal />
        </div>
      </div>
    </main>
  );
}