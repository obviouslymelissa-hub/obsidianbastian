/**
 * Obsidian Bastian - Header Injection Script
 * 
 * This script injects the shared site header into all pages at runtime.
 * It provides a single source of truth for the header across the site.
 * 
 * Usage:
 * 1. Add <div id="site-header-placeholder" data-skip-return="false"></div> to your HTML
 * 2. Include this script: <script src="js/header-inject.js"></script>
 * 3. The header will be injected on DOMContentLoaded
 * 
 * For pages that should NOT show the "Return to Command Hub" link (like index.html):
 * Use: <div id="site-header-placeholder" data-skip-return="true"></div>
 */

(function() {
  'use strict';

  // Header HTML template
  const headerHTML = `
    <header class="site-header" role="banner">
      <div class="header-inner">
        <!-- Left: Logo and Site Title -->
        <div class="header-left">
          <div class="site-logo" aria-hidden="true">
            <img src="https://obviouslymelissa-hub.github.io/obsidianbastian/images/StrOpBoard.png" alt="Obsidian Bastian emblem">
          </div>
          <h1 class="site-title">Obsidian Bastian</h1>
        </div>

        <!-- Center: Navigation -->
        <nav class="header-center site-nav" aria-label="Main navigation">
          <!-- Navigation links can be added per page or here -->
        </nav>

        <!-- Right: Utilities and Return Link -->
        <div class="header-right">
          <!-- Return to Command Hub - conditionally rendered -->
          <a href="https://obviouslymelissa-hub.github.io/obsidianbastian/onboardcomputer.html" 
             class="return-link" 
             id="return-to-hub"
             aria-label="Return to Command Hub"
             style="display: none;">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 0L0 8l8 8 1.5-1.5L3.5 8.5H16v-2H3.5l6-6z"/>
            </svg>
            Return to Command Hub
          </a>
        </div>
      </div>
    </header>
  `;

  /**
   * Inject the header into the page
   */
  function injectHeader() {
    const placeholder = document.getElementById('site-header-placeholder');
    
    if (!placeholder) {
      // No placeholder found - skip injection
      return;
    }

    // Check if we should skip the return link
    const skipReturn = placeholder.getAttribute('data-skip-return') === 'true';

    // Create a temporary container to parse the HTML
    const temp = document.createElement('div');
    temp.innerHTML = headerHTML.trim();
    const header = temp.firstElementChild;

    // Show or hide the return link based on the data attribute
    if (!skipReturn) {
      const returnLink = header.querySelector('#return-to-hub');
      if (returnLink) {
        returnLink.style.display = 'inline-flex';
      }
    }

    // Replace the placeholder with the header
    placeholder.parentNode.replaceChild(header, placeholder);

    // Log for debugging (can be removed in production)
    if (window.console && console.log) {
      console.log('Obsidian Bastian: Header injected successfully', {
        skipReturn: skipReturn,
        page: window.location.pathname
      });
    }
  }

  /**
   * Initialize when DOM is ready
   */
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectHeader);
    } else {
      // DOM is already loaded
      injectHeader();
    }
  }

  // Start initialization
  init();
})();
