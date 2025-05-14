/* src/utils/toast.ts
   Simple in-app toast / snackbar helper.
   CSS classes assume Tailwind. */

let holder: HTMLDivElement | null = null;

export function toast(msg: string, ms = 2500) {
  if (!holder) {
    holder = Object.assign(document.createElement('div'), {
      className:
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] space-y-2',
    });
    document.body.appendChild(holder);
  }

  const div = document.createElement('div');
  div.textContent = msg;
  div.className =
    'px-4 py-2 rounded bg-gray-800 text-gray-100 shadow-lg animate-fade-in';
  holder.appendChild(div);

  setTimeout(() => div.remove(), ms);
}
