'use client';

import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { TTYEngine } from '@/core/tty/TTYEngine';

import '@xterm/xterm/css/xterm.css';

export default function Terminal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTerm | null>(null);

  useEffect(() => {
    if (!containerRef.current || termRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: 'block',
      fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
      fontSize: 15,
      lineHeight: 1.3,
      letterSpacing: 0.5,
      allowTransparency: true,
      scrollback: 5000,
      theme: {
        background: '#0d0714',
        foreground: '#f3e8ff',
        cursor: '#f472b6', // Розовый брендовый курсор
        cursorAccent: '#0d0714',
        selectionBackground: 'rgba(168, 85, 247, 0.3)',
        black: '#190e28',
        red: '#fb7185',
        green: '#34d399',
        yellow: '#fbbf24',
        blue: '#c084fc',
        magenta: '#e879f9',
        cyan: '#38bdf8',
        white: '#f3e8ff',
        brightBlack: '#4c3a64',
        brightRed: '#fda4af',
        brightGreen: '#6ee7b7',
        brightYellow: '#fde047',
        brightBlue: '#d8b4fe',
        brightMagenta: '#f0abfc',
        brightCyan: '#7dd3fc',
        brightWhite: '#ffffff',
      }
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);

    const engine = new TTYEngine(term);
    engine.start();

    termRef.current = term;

    // Адаптивный расчет размера шрифта и подгонка сетки
    const doFit = () => {
      if (!containerRef.current) return;
      try {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        if (width > 0 && height > 0) {
          // Вычисляем оптимальный fontSize под ширину экрана
          let newFontSize = 14;
          if (width >= 2560) {
            newFontSize = 22; // 2K / 4K и Ultrawide
          } else if (width >= 1920) {
            newFontSize = 18; // Full HD / 2K
          } else if (width >= 1440) {
            newFontSize = 16; // Ноутбуки / Средние мониторы
          } else if (width < 640) {
            newFontSize = 12; // Мобилки
          }

          if (term.options.fontSize !== newFontSize) {
            term.options.fontSize = newFontSize;
          }

          fitAddon.fit();
        }
      } catch (e) {
        // Игнорируем ошибки при анмаунте
      }
    };

    doFit();

    let rafId: number;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(doFit);
    });

    observer.observe(containerRef.current);
    window.addEventListener('resize', doFit);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', doFit);
      observer.disconnect();
      term.dispose();
      termRef.current = null;
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#090d16] [&_.xterm]:!h-full [&_.xterm-viewport]:!bg-transparent [&_.xterm-viewport]:scrollbar-thin [&_.xterm-viewport]:scrollbar-thumb-sky-500/20 [&_.xterm-screen]:!h-full">
      <div ref={containerRef} className="w-full h-full p-2 sm:p-3 md:p-4" />
    </div>
  );
}