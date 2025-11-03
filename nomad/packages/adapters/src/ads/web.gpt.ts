// Google Publisher Tag (GPT) adapter for web

export interface GPTSlot {
  adUnitPath: string;
  size: [number, number] | Array<[number, number]>;
  divId: string;
}

export interface GPTConfig {
  publisherId: string;
  enableSingleRequest?: boolean;
  enableAsyncRendering?: boolean;
}

export class GPTManager {
  private initialized = false;
  private config: GPTConfig | null = null;
  private slots = new Map<string, GPTSlot>();

  initialize(config: GPTConfig): void {
    if (this.initialized) {
      return;
    }

    this.config = config;

    if (typeof window === 'undefined') {
      return;
    }

    // Load GPT script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagservices.com/tag/js/gpt.js';
    document.head.appendChild(script);

    script.onload = () => {
      if (window.googletag) {
        window.googletag.cmd.push(() => {
          window.googletag.pubads().enableSingleRequest(
            config.enableSingleRequest ?? true
          );
          window.googletag.pubads().enableAsyncRendering(
            config.enableAsyncRendering ?? true
          );
          window.googletag.enableServices();
        });
      });
    };

    this.initialized = true;
  }

  defineSlot(slot: GPTSlot): void {
    if (typeof window === 'undefined' || !window.googletag) {
      return;
    }

    this.slots.set(slot.divId, slot);

    window.googletag.cmd.push(() => {
      const gptSlot = window.googletag
        .defineSlot(slot.adUnitPath, slot.size, slot.divId)
        .addService(window.googletag.pubads());

      if (gptSlot) {
        // Set targeting if needed
        gptSlot.setTargeting('app', 'nomad');
      }
    });
  }

  display(divId: string): void {
    if (typeof window === 'undefined' || !window.googletag) {
      return;
    }

    const slot = this.slots.get(divId);
    if (!slot) {
      console.warn(`Slot ${divId} not defined`);
      return;
    }

    window.googletag.cmd.push(() => {
      window.googletag.display(divId);
    });
  }

  refresh(divId?: string): void {
    if (typeof window === 'undefined' || !window.googletag) {
      return;
    }

    window.googletag.cmd.push(() => {
      if (divId) {
        const slot = this.slots.get(divId);
        if (slot) {
          window.googletag.pubads().refresh([window.googletag.pubads().getSlots().find(s => s.getSlotElementId() === divId)]);
        }
      } else {
        window.googletag.pubads().refresh();
      }
    });
  }

  destroySlot(divId: string): void {
    if (typeof window === 'undefined' || !window.googletag) {
      return;
    }

    window.googletag.cmd.push(() => {
      const slots = window.googletag.pubads().getSlots();
      const slot = slots.find((s) => s.getSlotElementId() === divId);
      if (slot) {
        window.googletag.destroySlots([slot]);
      }
    });

    this.slots.delete(divId);
  }
}

// Type augmentation for window.googletag
declare global {
  interface Window {
    googletag?: {
      cmd: Array<() => void>;
      pubads: () => {
        enableSingleRequest: (enable: boolean) => void;
        enableAsyncRendering: (enable: boolean) => void;
        enableServices: () => void;
        refresh: (slots?: unknown[]) => void;
        getSlots: () => Array<{ getSlotElementId: () => string }>;
      };
      defineSlot: (path: string, size: [number, number] | Array<[number, number]>, divId: string) => unknown;
      display: (divId: string) => void;
      destroySlots: (slots: unknown[]) => void;
    };
  }
}

export const gptManager = new GPTManager();
