/**
 * Obsidian Bastian — Header Injector
 * Runtime header injection for consistent site-wide header
 * Looks for <div id="header-placeholder"></div> and injects shared header HTML
 */

(function() {
  'use strict';
  
  // Check if we're on index.html - if so, don't inject the "Return to Command Hub" button
  const isIndexPage = window.location.pathname.endsWith('index.html') || 
                      window.location.pathname === '/' ||
                      window.location.pathname.endsWith('/');
  
  // Header HTML template
  const headerHTML = `
    <header class="site-header" role="banner" aria-label="Obsidian Bastian header">
      <div class="header-inner">
        <!-- Left side: emblem + stacked title -->
        <div class="hero-left">
          <div class="emblem" aria-hidden="true" title="Obsidian Bastian emblem">
            <img class="emblem-img" src="https://obviouslymelissa-hub.github.io/obsidianbastian/images/StrOpBoard.png" alt="Strategic Operations Board emblem">
          </div>

          <div class="header-text" aria-label="Site title">
            <h1>Obsidian Bastian</h1>
            <h2>Registry &amp; Operations</h2>
          </div>
        </div>

        <!-- Right side: ship image ${!isIndexPage ? '+ Return to Command Hub button' : ''} -->
        <div class="hero-right">
          <div class="ship-img-wrap" id="shipWrap">
            <img class="ship-img" src="https://obviouslymelissa-hub.github.io/obsidianbastian/images/ship-header.jpg" alt="Obsidian Bastian ship">
          </div>
          
          ${!isIndexPage ? `
          <!-- Return to Command Hub button (only on non-index pages) -->
          <a href="https://obviouslymelissa-hub.github.io/obsidianbastian/onboardcomputer.html" 
             class="return-command-hub" 
             aria-label="Return to Command Hub">
            ← Command Hub
          </a>
          ` : ''}
        </div>
      </div>
    </header>
  `;
  
  /**
   * Inject the header into the placeholder
   */
  function injectHeader() {
    const placeholder = document.getElementById('header-placeholder');
    
    if (placeholder) {
      placeholder.innerHTML = headerHTML;
      
      // Add parallax effect to ship image (optional, only if not reduced motion)
      const shipWrap = document.getElementById('shipWrap');
      const shipImg = shipWrap ? shipWrap.querySelector('.ship-img') : null;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
      
      if (!reduce && !isTouch && shipWrap && shipImg) {
        const maxRotate = 6;
        const maxTranslate = 6;
        
        function onMove(e) {
          const rect = shipWrap.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const clientX = e.clientX || (e.touches && e.touches[0].clientX);
          const clientY = e.clientY || (e.touches && e.touches[0].clientY);
          const dx = (clientX - cx) / rect.width;
          const dy = (clientY - cy) / rect.height;
          const rotY = dx * maxRotate;
          const rotX = -dy * maxRotate;
          const tx = dx * maxTranslate;
          const ty = dy * maxTranslate;
          shipWrap.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
          shipImg.style.transform = `scale(1.02) translate3d(${tx * -0.35}px, ${ty * -0.35}px, 0)`;
        }
        
        function onLeave() {
          shipWrap.style.transform = '';
          shipImg.style.transform = '';
        }
        
        const headerInner = document.querySelector('.header-inner');
        if (headerInner) {
          headerInner.addEventListener('mousemove', onMove);
          headerInner.addEventListener('mouseleave', onLeave);
          headerInner.addEventListener('touchmove', onMove, { passive: true });
          headerInner.addEventListener('touchend', onLeave);
        }
      }
    }
  }
  
  // Inject when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectHeader);
  } else {
    // DOM already loaded
    injectHeader();
  }
})();
