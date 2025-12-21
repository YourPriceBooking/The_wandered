'use client';

if (typeof window !== 'undefined' && !customElements.get('hotfx-shy-header')) {
  const sheet = new CSSStyleSheet();

  sheet.replaceSync(`
    hotfx-shy-header {
      display: block;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
      transition: transform 0.3s ease-out;
      will-change: transform;
      z-index: 1000;
    }

    hotfx-shy-header.hidden {
      transform: translateY(-100%);
    }
  `);

  document.adoptedStyleSheets.push(sheet);

  class HotFXShyHeader extends HTMLElement {
    lastScroll = 0;
    lastMaxScroll = 0;

    connectedCallback() {
      const height = this.offsetHeight;
      document.documentElement.style.setProperty(
        '--shy-header-height',
        `${height}px`
      );
      document.addEventListener('scroll', this.handleScroll, { passive: true });
    }

    disconnectedCallback() {
      document.removeEventListener('scroll', this.handleScroll);
    }

    handleScroll = () => {
      const y = window.scrollY;

      if (y > Math.max(300, this.lastScroll)) {
        this.classList.add('hidden');
      } else if (y < this.lastMaxScroll - 100) {
        this.classList.remove('hidden');
        this.lastMaxScroll = y;
      }

      this.lastScroll = y;

      if (y > this.lastMaxScroll) {
        this.lastMaxScroll = y;
      }
    };
  }

  customElements.define('hotfx-shy-header', HotFXShyHeader);
}
