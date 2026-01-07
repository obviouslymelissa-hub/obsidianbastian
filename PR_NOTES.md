# Site Consistency Optimization - PR Notes

## Overview

This pull request unifies the site header and theme across all pages of the Obsidian Bastian project, improves dropdown legibility, and adds a new Carter's Star dedication page. The changes establish a centralized theme system and shared header component to ensure consistency and ease future maintenance.

## What Changed

### 1. Centralized Theme System

**File: `css/_theme.css`**

- Extracted CSS variables from `index.html` as the canonical source
- Defined consistent colors, fonts, spacing, and layout variables
- Added accessible styling for buttons, dropdowns, and common UI elements
- Includes responsive design breakpoints and accessibility features
- All pages can now reference this single theme file for consistent styling

**Color Palette (from index.html):**
- Background: `#0f1318` (--bg-dark), `#151821` (--bg-panel)
- Accent: `#4fd1c5` (--accent), `#7ef0df` (--accent-2)
- Text: `#e6eef2` (--text-main), `#9fb2bf` (--text-muted)
- Border: `#22272f` (--border)

**WCAG AA Compliance:** Color combinations meet accessibility standards for contrast where practical.

### 2. Shared Header System

**Files:**
- `partials/header.html` - Reference copy of header markup
- `js/header-inject.js` - Runtime header injection script

**How it works:**
1. Each page includes a placeholder: `<div id="site-header-placeholder" data-skip-return="false"></div>`
2. The `header-inject.js` script injects the shared header at runtime
3. The "Return to Command Hub" link appears on all pages EXCEPT index.html (which uses `data-skip-return="true"`)
4. Return link uses absolute URL: `https://obviouslymelissa-hub.github.io/obsidianbastian/onboardcomputer.html`

**Header Structure:**
- **Left:** Site logo and title
- **Center:** Navigation area (can be customized per page)
- **Right:** "Return to Command Hub" button (with left arrow SVG icon)

### 3. Improved Dropdown Styling

**Enhanced in `css/_theme.css`:**
- Dark background with light text for better contrast
- Increased padding (10px 14px) and font size (1rem)
- Custom arrow indicator
- Hover and focus states with accent color
- Accessible keyboard navigation support

**JavaScript Support:** `js/app.js` includes utilities for initializing custom-styled dropdowns if needed.

### 4. Carter's Star Page

**File: `carters-star.html`**

A complete scaffold page for the Carter's Star dedication with:
- **Hero section** with star name and subtitle
- **Star image placeholder** (square aspect ratio, ready for replacement)
- **Info card** with:
  - Designation (CS-2026-001)
  - Coordinates (placeholder)
  - Constellation (placeholder)
  - Apparent Magnitude (placeholder)
  - Discovery Date (placeholder)
  - Distance (placeholder)
- **Dedication section** with customizable message and metadata
- **Certificate section** styled as an official registry document
- **Maintainer instructions** embedded in the page

**Customization:** All placeholder content is marked with HTML comments labeled "MAINTAINER NOTE" for easy identification.

### 5. Shared JavaScript Utilities

**File: `js/app.js`**

Provides centralized utilities:
- `initCustomDropdowns()` - Enhanced dropdown styling system
- `$()` - Quick element selection helper
- `formatDate()` - Date formatting utility
- `debounce()` - Event handler optimization
- `notify()` - Toast notification system

### 6. Updated HTML Pages

All top-level HTML pages have been updated to include:
1. Reference to `css/_theme.css`
2. Header placeholder div with appropriate `data-skip-return` attribute
3. Script tags for `js/header-inject.js` and `js/app.js`

**Pages updated:**
- achievements.html
- communications.html
- crew.html
- defense.html
- diagnostics.html
- mainframe-health.html
- mainframeweather.html
- navigationconsole.html
- onboardcomputer.html
- partsinventory.html
- powermanagement.html
- index.html (with `data-skip-return="true"`)

## How to Update the Header in the Future

Since this is a static site, the header is injected at runtime using JavaScript. To update the header across all pages:

### Option 1: Edit the JavaScript (Recommended)

1. Open `js/header-inject.js`
2. Find the `headerHTML` constant (around line 24)
3. Edit the HTML string directly
4. Save the file - changes will apply to all pages automatically

### Option 2: Edit the Reference HTML

1. Open `partials/header.html`
2. Make your changes to the header structure
3. Copy the updated HTML
4. Paste it into the `headerHTML` string in `js/header-inject.js`
5. Save both files

**Note:** The actual header rendered on pages comes from `js/header-inject.js`, not from `partials/header.html`. The partial file is a reference copy for easier editing outside of a JavaScript string.

## How to Customize Carter's Star Page

1. **Update Star Image:**
   - Add your star image to `/images/` directory
   - Recommended: Square aspect ratio (e.g., 800x800px)
   - Edit `carters-star.html` and replace the `.star-image-placeholder` div with:
     ```html
     <img src="images/your-star-image.jpg" alt="Carter's Star" style="width: 100%; max-width: 500px; border-radius: 12px;">
     ```

2. **Update Star Information:**
   - Search for "MAINTAINER" comments in `carters-star.html`
   - Update the following fields:
     - Star designation
     - Coordinates (Right Ascension and Declination)
     - Constellation
     - Apparent magnitude
     - Discovery/dedication date
     - Distance

3. **Customize Dedication Message:**
   - Edit the paragraph text in the "Dedication Section"
   - Update the dedicator name and date in "dedication-meta"

4. **Modify Certificate:**
   - Edit the certificate content in the "Certificate Section"
   - Add additional registry information as needed

All changes are made directly in the HTML file - no backend required.

## Dropdown Styling Implementation

Dropdowns are automatically styled by the theme CSS. For custom behavior:

1. **Standard Select Elements:** 
   - Will automatically use the theme styling from `css/_theme.css`
   - No additional code needed

2. **Custom Enhanced Dropdowns:**
   - Add class `custom-styled` to any `<select>` element
   - Include `js/app.js` in your page
   - The script will automatically enhance the dropdown on page load
   - Example: `<select class="custom-styled">...</select>`

## Testing the Changes

1. **Header Injection:**
   - Open any page and verify the header appears
   - Check that the "Return to Command Hub" link is present (except on index.html)
   - Verify the link works and navigates to onboardcomputer.html

2. **Theme Consistency:**
   - Compare colors across different pages
   - Verify buttons, dropdowns, and panels match the index.html design

3. **Carter's Star Page:**
   - Navigate to `/carters-star.html`
   - Verify all sections render correctly
   - Check responsive behavior on mobile devices

4. **Dropdowns:**
   - Test the travel speed dropdown on navigationconsole.html
   - Verify dark background and light text
   - Check keyboard navigation (Tab, Enter, Arrow keys)

## Browser Compatibility

- Chrome/Edge: ✓ Tested
- Firefox: ✓ Tested
- Safari: ✓ Expected to work (uses standard CSS/JS)
- Mobile browsers: ✓ Responsive design included

## Accessibility Features

- WCAG AA contrast ratios for text and backgrounds
- Keyboard navigation support for all interactive elements
- ARIA labels and roles for screen readers
- Focus indicators for keyboard users
- Reduced motion support via `prefers-reduced-motion` media query
- High contrast mode support

## Breaking Changes

**None.** All changes are additive and backward-compatible:
- Existing pages continue to work without modification
- The theme CSS is an addition, not a replacement
- Header injection is opt-in via placeholder div
- No existing functionality has been removed

## Future Enhancements

Consider these improvements for future PRs:
- Add more navigation links to the shared header
- Create additional utility functions in `js/app.js`
- Implement a dark/light theme toggle
- Add more custom-styled components
- Create additional dedication pages for other crew members
- Implement a star catalog/registry listing page

## Deployment

This is a static site deployed on GitHub Pages. After merging:
1. Changes will automatically deploy to: `https://obviouslymelissa-hub.github.io/obsidianbastian/`
2. The Carter's Star page will be accessible at: `https://obviouslymelissa-hub.github.io/obsidianbastian/carters-star.html`
3. All pages will use the unified header and theme

## Questions or Issues?

If you encounter any issues or have questions about these changes:
1. Check the HTML comments in the files (marked with "MAINTAINER NOTE")
2. Review this PR_NOTES.md document
3. Open an issue in the GitHub repository
4. Contact the development team

---

**PR Title:** site: unify header, theme, dropdowns, and add carters-star page

**Branch:** optimize/site-consistency → main

**Author:** GitHub Copilot Agent

**Date:** January 2026
