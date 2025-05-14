/* src/utils/dom.ts
 * Tiny DOM helpers shared across modules.
 */

export const $ = (id: string): HTMLElement =>
  document.getElementById(id)!;

/* legacy alias so old code that called id('foo') keeps working */
export const id = $;

/** create a <button> with classes and click handler */
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
