'use client';

if (typeof window !== 'undefined' && !customElements.get('hotfx-shy-header')) {
  const sheet = new CSSStyleSheet();

  sheet.replaceSync(`
    hotfx-shy-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      display: block;
      background: white;
      z-index: 1000;
      transition: transform 0.3s ease-out;
      will-change: transform;
    }

    hotfx-shy-header.hidden {
      transform: translateY(-100%);
    }
  `);

  document.adoptedStyleSheets.push(sheet);

  class HotFXShyHeader extends HTMLElement {
    lastScroll = 0;
    lastMaxScroll = 0;
    lenis: any = null;

    connectedCallback() {
      const waitForLenis = () => {
        const lenis = (window as any).lenis;

        if (!lenis) {
          requestAnimationFrame(waitForLenis);
          return;
        }
        this.lenis = lenis;

        lenis.on('scroll', ({ scroll }: { scroll: number }) => {
          this.handleScroll(scroll);
        });
      };

      waitForLenis();
    }

    disconnectedCallback() {
      if (this.lenis) {
        this.lenis.off('scroll');
      }
    }

    handleScroll(scrollY: number) {

      if (scrollY > Math.max(300, this.lastScroll)) {
        this.classList.add('hidden');
      } else if (scrollY < this.lastMaxScroll - 100) {
        this.classList.remove('hidden');
        this.lastMaxScroll = scrollY;
      }

      this.lastScroll = scrollY;

      if (scrollY > this.lastMaxScroll) {
        this.lastMaxScroll = scrollY;
      }
    }
  }

  customElements.define('hotfx-shy-header', HotFXShyHeader);
}
