/**
 * Header Injection Script for Obsidian Bastian
 * 
 * This script dynamically injects the shared header at the top of the page body.
 * It's an optional approach to reduce duplication in the future.
 * 
 * Usage: Add <script src="/js/header-inject.js"></script> at the end of <body>
 */

(function() {
  'use strict';
  
  // Don't inject on index.html (home page)
  if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    return;
  }
  
  // Header HTML template
  const headerHTML = `
    <header class="site-header">
      <div class="site-header-inner" role="banner" aria-label="Obsidian Bastian header">
        <!-- Left side: emblem + site title -->
        <div class="header-left">
          <div class="site-emblem" aria-hidden="true" title="Obsidian Bastian emblem">
            <img src="https://obviouslymelissa-hub.github.io/obsidianbastian/images/StrOpBoard.png" alt="Strategic Operations Board">
          </div>
          
          <div class="site-header-text" aria-label="Site title">
            <h1>Obsidian Bastian</h1>
            <h2>Ship Systems</h2>
          </div>
        </div>
        
        <!-- Right side: Return to Command Hub button -->
        <div class="header-right">
          <a href="https://obviouslymelissa-hub.github.io/obsidianbastian/onboardcomputer.html" 
             class="return-command-hub" 
             aria-label="Return to Command Hub">
            ← Return to Command Hub
          </a>
        </div>
      </div>
    </header>
  `;
  
  // Inject header at the start of body
  if (document.body) {
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
  } else {
    // If body not ready, wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', function() {
      document.body.insertAdjacentHTML('afterbegin', headerHTML);
    });
  }
})();
