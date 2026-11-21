import { Terminal } from '@xterm/xterm';

interface BootStep {
  text: string;
  delay: number;
}

export class SystemdBootAnimation {
  private term: Terminal;

  constructor(term: Terminal) {
    this.term = term;
  }

  private bootLogs: BootStep[] = [
    // --- Early Ramdisk & Arch Init ---
    { text: ':: Initializing ramdisk process...', delay: 180 },
    { text: ':: Unpacking initramfs image...', delay: 120 },
    { text: ':: Loading essential kernel modules (nvme, amdgpu, btrfs)...', delay: 150 },
    { text: 'Starting systemd-udevd version 255.4-2-arch...', delay: 110 },

    // --- Core Systemd Setup ---
    { text: '[  OK  ] Started udev Kernel Device Manager.', delay: 90 },
    { text: '[  OK  ] Created slice System Slice.', delay: 70 },
    { text: '[  OK  ] Created slice User and Session Slice.', delay: 70 },
    { text: '[  OK  ] Created slice Slice /system/modprobe.', delay: 60 },
    { text: '[  OK  ] Started Journal Service.', delay: 100 },
    { text: '[  OK  ] Started Dispatch Password Requests to Console Directory Watch.', delay: 80 },

    // --- Kernel Filesystems & Tracing ---
    { text: '[  OK  ] Reached target Local File Systems (Pre).', delay: 80 },
    { text: '[  OK  ] Mounted /sys/kernel/debug.', delay: 70 },
    { text: '[  OK  ] Mounted /sys/kernel/tracing.', delay: 60 },
    { text: '[  OK  ] Mounted Huge Pages File System.', delay: 70 },
    { text: '[  OK  ] Mounted POSIX Message Queue File System.', delay: 65 },

    // --- Memory & Storage ---
    { text: '[  OK  ] Activated swap /dev/zram0.', delay: 110 },
    { text: '[  OK  ] Reached target Swaps.', delay: 75 },
    { text: '[  OK  ] Finished File System Check on /dev/nvme0n1p2.', delay: 160 },
    { text: '[  OK  ] Mounted Root File System (/dev/nvme0n1p2 [btrfs]).', delay: 120 },
    { text: '[  OK  ] Remounted Root and Kernel File Systems.', delay: 90 },
    { text: '[  OK  ] Mounted /home.', delay: 100 },
    { text: '[  OK  ] Reached target Local File Systems.', delay: 80 },

    // --- System Services & Devices ---
    { text: '[  OK  ] Finished Coldplug All udev Devices.', delay: 130 },
    { text: '[  OK  ] Started Load/Save Random Seed.', delay: 85 },
    { text: '[  OK  ] Started Apply Kernel Variables.', delay: 75 },
    { text: '[  OK  ] Started D-Bus System Message Bus.', delay: 110 },
    { text: '[  OK  ] Started User Login Management.', delay: 95 },

    // --- Networking & Wireless ---
    { text: '[  OK  ] Started Network Manager.', delay: 140 },
    { text: '[  OK  ] Started Bluetooth service.', delay: 105 },
    { text: '[  OK  ] Reached target Network.', delay: 80 },
    { text: '[  OK  ] Reached target Network is Online.', delay: 90 },

    // --- Audio & Wayland Stack ---
    { text: '[  OK  ] Started PipeWire Multimedia Service.', delay: 120 },
    { text: '[  OK  ] Started PipeWire PulseAudio Replacement.', delay: 95 },
    { text: '[  OK  ] Started WirePlumber Session Manager.', delay: 100 },

    // --- nixaDev Custom Web Engine ---
    { text: '[  OK  ] Initialized nixaDev Web Core Engine.', delay: 220 },
    { text: '[  OK  ] Allocated V8 Isolate Memory Heap.', delay: 130 },
    { text: '[  OK  ] Loaded React 19 & Next.js App Router Core.', delay: 150 },
    { text: '[  OK  ] Hydrated Server Component Tree.', delay: 140 },

    // --- Environment Context & Shell Interface ---
    { text: '[  OK  ] Loaded Hyprland Environment Context.', delay: 180 },
    { text: '[  OK  ] Applied Wayland Compositor Flags & Hardware Accel.', delay: 130 },
    { text: '[  OK  ] Mounted Virtual Interactivity Layer (/dev/tty1).', delay: 110 },
    { text: '[  OK  ] Loaded Environment Variables (.env.production).', delay: 90 },
    { text: '[  OK  ] Initialized Virtual File System (VFS Node Storage).', delay: 160 },
    { text: '[  OK  ] Registered POSIX Command Execution Subsystem.', delay: 130 },

    // --- Ready State ---
    { text: '[  OK  ] Started nixaDev Portfolio Interactive Shell.', delay: 260 },
    { text: '[  OK  ] Reached target Graphical Interface.', delay: 190 },
    { text: 'Arch Linux 6.8.9-arch1-1 (tty1)', delay: 90 },
    { text: 'nixa-desktop login: nixadev (automatic login)', delay: 120 },
    { text: 'Welcome to nixaDev OS v2.4 (x86_64)', delay: 3000 },
  ];

  public async run(): Promise<void> {
    this.term.clear();

    for (const step of this.bootLogs) {
      const formattedLine = this.formatLine(step.text);
      this.term.write(formattedLine + '\r\n');
      await new Promise((resolve) => setTimeout(resolve, step.delay));
    }

    // Небольшая задержка перед очисткой экрана
    await new Promise((resolve) => setTimeout(resolve, 600));
    this.term.clear();
  }

  private formatLine(text: string): string {
    if (text.startsWith('[  OK  ]')) {
      return text.replace('[  OK  ]', '[\x1b[32m  OK  \x1b[0m]');
    }
    if (text.startsWith('::')) {
      return `\x1b[34m${text}\x1b[0m`;
    }
    return text;
  }
}