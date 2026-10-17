'use client';

if (typeof window !== 'undefined' && !customElements.get('hotfx-shy-header')) {
  class HotFXShyHeader extends HTMLElement {
    private lastScroll = 0;
    private distance = 0;
    private frame: number | null = null;

    private scrollPosition = () => {
      const max = Math.max(0, document.documentElement.scrollHeight - document.documentElement.clientHeight);
      // Ignore elastic overscroll at both ends on touch devices.
      return Math.min(max, Math.max(0, window.scrollY));
    };

    private reveal = () => {
      this.classList.remove('hidden');
      this.distance = 0;
      this.lastScroll = this.scrollPosition();
    };

    private update = () => {
      this.frame = null;
      const scroll = this.scrollPosition();
      const delta = scroll - this.lastScroll;
      this.lastScroll = scroll;
      if (delta === 0) return;
      this.distance = Math.sign(delta) === Math.sign(this.distance) ? this.distance + delta : delta;
      if (scroll <= 80 || (this.contains(document.activeElement) && document.activeElement?.matches(':focus-visible'))) {
        this.reveal();
      } else if (scroll > 300 && this.distance >= 12) {
        this.classList.add('hidden');
      } else if (this.distance <= -12) {
        this.classList.remove('hidden');
      }
    };

    private onScroll = () => {
      if (this.frame === null) this.frame = requestAnimationFrame(this.update);
    };

    connectedCallback() {
      this.reveal();
      window.addEventListener('scroll', this.onScroll, { passive: true });
      this.addEventListener('focusin', this.reveal);
      this.addEventListener('shy-header-reset', this.reveal);
    }

    disconnectedCallback() {
      window.removeEventListener('scroll', this.onScroll);
      this.removeEventListener('focusin', this.reveal);
      this.removeEventListener('shy-header-reset', this.reveal);
      if (this.frame !== null) cancelAnimationFrame(this.frame);
      this.frame = null;
    }
  }

  customElements.define('hotfx-shy-header', HotFXShyHeader);
}
