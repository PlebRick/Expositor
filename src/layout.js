// File: src/layout.js

/**
 * Initializes the sidebar and theme toggle buttons.
 */
export function initToggles() {
  // Sidebar show/hide
  const sidebarBtn = document.getElementById('btn-toggle-sidebar');
  if (sidebarBtn) {
    sidebarBtn.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('hidden');
    });
  }

  // Dark/light mode
  const themeBtn = document.getElementById('btn-toggle-theme');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
    });
  }
}

/**
 * Initializes the drag handles for resizing columns.
 */
export function initDraggable() {
  const h1 = document.getElementById('drag-handle-1');
  const h2 = document.getElementById('drag-handle-2');
  const cont = document.getElementById('content');
  const sb   = document.getElementById('sidebar');
  const rp   = document.getElementById('right-panel');
  let drag = null;

  const onMove = e => {
    if (drag === 'sidebar') {
      sb.style.width = Math.min(Math.max(e.clientX, 150), cont.clientWidth - 200) + 'px';
    }
    if (drag === 'right') {
      const rect = cont.getBoundingClientRect();
      rp.style.width = Math.min(Math.max(rect.right - e.clientX, 200), rect.width - 150) + 'px';
    }
  };

  const onUp = () => {
    drag = null;
    document.body.style.cursor = '';
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  };

  const onDown = area => {
    drag = area;
    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  if (h1) h1.addEventListener('mousedown', () => onDown('sidebar'));
  if (h2) h2.addEventListener('mousedown', () => onDown('right'));
}

/**
 * Initializes the Settings gear button to open the slide-drawer in Settings mode.
 */
export function initSettings() {
  const settingsBtn = document.getElementById('btn-settings');
  if (!settingsBtn) return;

  settingsBtn.addEventListener('click', () => {
    const drawer = document.getElementById('slide-drawer');
    drawer.classList.remove('translate-x-full');

    // Set drawer title and body for Settings
    document.getElementById('drawer-title').textContent = 'Settings';
    document.getElementById('drawer-body').innerHTML = `
      <p class="mb-4">You can clear all per-chapter overrides here.</p>
      <button id="btn-clear-overrides"
              class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
        Clear All Overrides
      </button>
    `;

    // Close drawer when clicking the close button
    const closeBtn = document.getElementById('btn-close-drawer');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        drawer.classList.add('translate-x-full');
      });
    }

    // Clear all overrides when clicking the clear button
    const clearBtn = document.getElementById('btn-clear-overrides');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        Object.entries(window.manifest || {}).forEach(([book, count]) => {
          for (let c = 1; c <= count; c++) {
            localStorage.removeItem(`annotations_override:${book}:${c}`);
          }
        });
        alert('All overrides cleared.');
        drawer.classList.add('translate-x-full');
      });
    }
  });
}
