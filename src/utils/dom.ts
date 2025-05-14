/* src/utils/dom.ts */

export const $ = (id: string): HTMLElement =>
  document.getElementById(id)!;

/** create a button with classes, text and click handler */
export function button(
  text: string,
  className: string,
  onClick: () => void
) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = text;
  btn.className = className;
  btn.addEventListener('click', onClick);
  return btn;
}
