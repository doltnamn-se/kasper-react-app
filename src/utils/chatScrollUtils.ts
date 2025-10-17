/**
 * Chat scroll utilities for handling keyboard interactions on mobile
 * Implements bottom-relative scroll positioning to avoid iOS viewport issues
 */

// Helper: are we effectively at the bottom?
export function atBottom(el: HTMLElement | null, slack = 2): boolean {
  if (!el) return false;
  return (el.scrollHeight - el.scrollTop - el.clientHeight) <= slack;
}

// Keep position relative to bottom across layout changes
export function preserveBottom(el: HTMLElement | null, fn: () => void) {
  if (!el) {
    fn();
    return;
  }
  
  const fromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
  fn(); // make your DOM/style changes
  
  // Next frame so layout is measured after changes
  requestAnimationFrame(() => {
    el.scrollTop = el.scrollHeight - el.clientHeight - fromBottom;
  });
}

// Smooth "snap to bottom" that waits for Safari's auto-scroll to finish
let pendingSnap = 0;

export function snapToBottom(anchorElement: HTMLElement | null) {
  if (!anchorElement) return;
  
  const id = ++pendingSnap;
  // two RAFs + small timeout lets the keyboard animation settle on iOS
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (id !== pendingSnap) return;
        anchorElement.scrollIntoView({ block: 'end' });
      }, 50);
    });
  });
}

// Track keyboard overlap and set --kb
export function updateKeyboardInset() {
  const vv = window.visualViewport;
  if (!vv) return;
  
  const overlap = Math.max(0, (window.innerHeight - vv.height - vv.offsetTop));
  document.documentElement.style.setProperty('--kb', overlap + 'px');
}
