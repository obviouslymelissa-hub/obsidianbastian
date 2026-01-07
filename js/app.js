/**
 * Obsidian Bastian - Shared Application Utilities
 * 
 * This file contains shared JavaScript utilities used across the site,
 * including dropdown initialization and common UI helpers.
 */

(function(window) {
  'use strict';

  // Create a namespace for our utilities
  const ObsidianBastian = {
    version: '1.0.0'
  };

  /**
   * Initialize custom dropdowns
   * Converts standard select elements into styled custom dropdowns
   * 
   * @param {string} selector - CSS selector for select elements to enhance
   */
  ObsidianBastian.initCustomDropdowns = function(selector) {
    selector = selector || 'select.custom-styled';
    const selects = document.querySelectorAll(selector);

    selects.forEach(function(select) {
      if (select.dataset.customized) {
        return; // Already initialized
      }

      const wrapper = document.createElement('div');
      wrapper.className = 'custom-dropdown';

      const trigger = document.createElement('div');
      trigger.className = 'custom-dropdown-trigger';
      trigger.setAttribute('role', 'button');
      trigger.setAttribute('aria-haspopup', 'listbox');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('tabindex', '0');

      const selectedText = document.createElement('span');
      selectedText.className = 'custom-dropdown-text';
      selectedText.textContent = select.options[select.selectedIndex].text;

      const arrow = document.createElement('span');
      arrow.className = 'custom-dropdown-arrow';
      arrow.innerHTML = '▼';
      arrow.setAttribute('aria-hidden', 'true');

      trigger.appendChild(selectedText);
      trigger.appendChild(arrow);

      const menu = document.createElement('div');
      menu.className = 'custom-dropdown-menu';
      menu.setAttribute('role', 'listbox');

      Array.from(select.options).forEach(function(option, index) {
        const item = document.createElement('div');
        item.className = 'custom-dropdown-item';
        item.setAttribute('role', 'option');
        item.setAttribute('data-value', option.value);
        item.textContent = option.text;

        if (index === select.selectedIndex) {
          item.classList.add('selected');
        }

        item.addEventListener('click', function() {
          select.selectedIndex = index;
          selectedText.textContent = option.text;
          
          // Update selected state
          menu.querySelectorAll('.custom-dropdown-item').forEach(function(el) {
            el.classList.remove('selected');
          });
          item.classList.add('selected');

          // Close dropdown
          wrapper.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');

          // Trigger change event on original select
          const event = new Event('change', { bubbles: true });
          select.dispatchEvent(event);
        });

        menu.appendChild(item);
      });

      trigger.addEventListener('click', function() {
        const isOpen = wrapper.classList.toggle('open');
        trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      // Keyboard support
      trigger.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          trigger.click();
        }
      });

      // Close on outside click
      document.addEventListener('click', function(e) {
        if (!wrapper.contains(e.target)) {
          wrapper.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
        }
      });

      wrapper.appendChild(trigger);
      wrapper.appendChild(menu);
      select.parentNode.insertBefore(wrapper, select);
      select.style.display = 'none';
      select.dataset.customized = 'true';
    });
  };

  /**
   * Simple utility to get element by ID
   * 
   * @param {string} id - Element ID
   * @returns {HTMLElement|null}
   */
  ObsidianBastian.$ = function(id) {
    return document.getElementById(id);
  };

  /**
   * Format a date to a readable string
   * 
   * @param {Date|string} date - Date to format
   * @returns {string}
   */
  ObsidianBastian.formatDate = function(date) {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    
    if (!(date instanceof Date) || isNaN(date)) {
      return 'Invalid Date';
    }

    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleDateString('en-US', options);
  };

  /**
   * Debounce function for event handlers
   * 
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function}
   */
  ObsidianBastian.debounce = function(func, wait) {
    let timeout;
    return function executedFunction() {
      const context = this;
      const args = arguments;
      const later = function() {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  /**
   * Simple notification/toast system
   * 
   * @param {string} message - Message to display
   * @param {string} type - Type of notification (info, success, warning, error)
   * @param {number} duration - Duration in milliseconds (default: 3000)
   */
  ObsidianBastian.notify = function(message, type, duration) {
    type = type || 'info';
    duration = duration || 3000;

    const toast = document.createElement('div');
    toast.className = 'ob-toast ob-toast-' + type;
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    // Add styles if not already present
    if (!document.getElementById('ob-toast-styles')) {
      const styles = document.createElement('style');
      styles.id = 'ob-toast-styles';
      styles.textContent = `
        .ob-toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          padding: 12px 18px;
          border-radius: 8px;
          background: var(--bg-panel, #151821);
          color: var(--text-main, #e6eef2);
          border: 1px solid var(--border, #22272f);
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          z-index: 10000;
          animation: ob-toast-in 0.3s ease;
          max-width: 400px;
        }
        @keyframes ob-toast-in {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .ob-toast-success { border-left: 4px solid var(--color-success, #4fd1c5); }
        .ob-toast-warning { border-left: 4px solid var(--color-warning, #ffcb6b); }
        .ob-toast-error { border-left: 4px solid var(--color-danger, #ff7b7b); }
        .ob-toast-info { border-left: 4px solid var(--color-info, #66a0ff); }
      `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(toast);

    setTimeout(function() {
      toast.style.animation = 'ob-toast-in 0.3s ease reverse';
      setTimeout(function() {
        document.body.removeChild(toast);
      }, 300);
    }, duration);
  };

  // Expose to global scope
  window.ObsidianBastian = ObsidianBastian;

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      // Auto-init any elements marked for custom dropdown
      ObsidianBastian.initCustomDropdowns('.custom-styled');
    });
  } else {
    // DOM already loaded
    ObsidianBastian.initCustomDropdowns('.custom-styled');
  }

})(window);
