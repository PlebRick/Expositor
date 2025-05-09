// File: src/script.js
// Page Title: Expository Static — UI & Data Logic (ESV Integration + Annotations)
// ————————————————————————————————————————————————
// Handles: ESV fetching, sidebar/theme toggles, tab switching,
// panel resizing, outline/manuscript/commentary storage in localStorage,
// JSON import/export, drawer logic, + static-JSON load on startup.

console.log('🚀 Loaded updated script.js');

// === CONFIGURATION ===
const ESV_API_KEY = 'ae52874d73d8077e6a08246e63834e8451a230b3';

// === APP STATE ===
let manualOutlineData    = {};
let manualManuscriptData = {};
let manualCommentaryData = {};

let manifest     = {};
let currentBook  = '';
let currentChap  = '';

// === ENTRY POINT ===
window.addEventListener('DOMContentLoaded', async () => {
  // 1️⃣ Load static JSONs as fallback
  for (const [key, file] of [
    ['manualOutlineData',    'outline.json'],
    ['manualManuscriptData', 'manuscript.json'],
    ['manualCommentaryData', 'commentary.json']
  ]) {
    try {
      const resp = await fetch(`data/${file}`);
      const json = await resp.json();
      if (json && Object.keys(json).length) {
        window[key] = json;
      }
    } catch (err) {
      console.warn(`Could not load data/${file}`, err);
    }
  }

  // 2️⃣ Override from localStorage
  try { manualOutlineData    = JSON.parse(localStorage.getItem('manualOutline')    ) || manualOutlineData;    } catch {}
  try { manualManuscriptData = JSON.parse(localStorage.getItem('manualManuscript') ) || manualManuscriptData; } catch {}
  try { manualCommentaryData = JSON.parse(localStorage.getItem('manualCommentary') ) || manualCommentaryData; } catch {}

  // 3️⃣ Load manifest.json
  try {
    const resp = await fetch('data/manifest.json');
    manifest = await resp.json();
  } catch (err) {
    console.error('manifest.json load error', err);
  }

  // 4️⃣ Initialize UI
  initToggles();
  initTabs();
  initDraggable();
  setupImportExport();
  initDrawerLogic();

  // 5️⃣ Render sidebar
  renderSidebar(Object.keys(manifest));
});

// === IMPORT / EXPORT (all branches) ===
function setupImportExport() {
  // — Export button —
  const origExp = document.getElementById('btn-export');
  if (origExp) {
    const newExp = origExp.cloneNode(true);
    origExp.parentNode.replaceChild(newExp, origExp);
    newExp.addEventListener('click', () => {
      console.log('📤 Exporting all annotations…');
      const bundle = {
        outline:    manualOutlineData,
        manuscript: manualManuscriptData,
        commentary: manualCommentaryData
      };
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = 'manualAnnotations.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }

  // — Import button & file input —
  const origImp  = document.getElementById('btn-import');
  const inp      = document.getElementById('input-import');
  if (origImp && inp) {
    const newImp = origImp.cloneNode(true);
    origImp.parentNode.replaceChild(newImp, origImp);
    newImp.addEventListener('click', () => inp.click());
    inp.addEventListener('change', e => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const imported = JSON.parse(reader.result);
          manualOutlineData    = imported.outline    || {};
          manualManuscriptData = imported.manuscript || {};
          manualCommentaryData = imported.commentary || {};
          saveAll();
          renderSidebar(Object.keys(manifest));
          document.getElementById('center-panel').innerHTML =
            '<h2 class="text-xl font-bold mb-4">Select a book & chapter</h2>';
          document.getElementById('tab-content').textContent = 'Loading…';
          alert('Import successful!');
        } catch {
          alert('Invalid JSON import');
        }
      };
      reader.readAsText(file);
    });
  }
}

function saveAll() {
  localStorage.setItem('manualOutline',    JSON.stringify(manualOutlineData));
  localStorage.setItem('manualManuscript', JSON.stringify(manualManuscriptData));
  localStorage.setItem('manualCommentary', JSON.stringify(manualCommentaryData));
}

// === UI: Sidebar & Theme ===
function initToggles() {
  document.getElementById('btn-toggle-sidebar')
    .addEventListener('click', () => document.getElementById('sidebar').classList.toggle('hidden'));
  document.getElementById('btn-toggle-theme')
    .addEventListener('click', () => document.documentElement.classList.toggle('dark'));
}

// === UI: Tab Switching ===
function initTabs() {
  const tabs = document.querySelectorAll('nav button[data-tab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.replace('border-indigo-500','border-transparent'));
      tab.classList.replace('border-transparent','border-indigo-500');
      if (tab.dataset.tab === 'outline')      renderOutlineTab(currentBook, currentChap);
      else if (tab.dataset.tab === 'manuscript') renderManuscriptTab(currentBook, currentChap);
      else                                      renderCommentaryTab(currentBook, currentChap);
    });
  });
}

// === UI: Draggable Handles ===
function initDraggable() {
  const h1 = document.getElementById('drag-handle-1'),
        h2 = document.getElementById('drag-handle-2'),
        cont = document.getElementById('content'),
        sb   = document.getElementById('sidebar'),
        rp   = document.getElementById('right-panel');
  let drag=null;
  const onMove = e => {
    if (drag==='sidebar') sb.style.width = Math.min(Math.max(e.clientX,150),cont.clientWidth-200)+'px';
    if (drag==='right') {
      const r=cont.getBoundingClientRect();
      rp.style.width = Math.min(Math.max(r.right-e.clientX,200),r.width-150)+'px';
    }
  };
  const onUp = () => { drag=null; document.body.style.cursor=''; document.removeEventListener('mousemove',onMove); document.removeEventListener('mouseup',onUp); };
  const onDown = area => { drag=area; document.body.style.cursor='col-resize'; document.addEventListener('mousemove',onMove); document.addEventListener('mouseup',onUp); };
  h1.addEventListener('mousedown', ()=>onDown('sidebar'));
  h2.addEventListener('mousedown', ()=>onDown('right'));
}

// === RENDER: Sidebar ===
function renderSidebar(books) {
  const c = document.getElementById('sidebar-content');
  c.innerHTML = '';
  if (!books.length) { c.textContent = '📖 No books available…'; return; }
  const ul = document.createElement('ul'); ul.className='text-sm';
  books.forEach(book => {
    const li = document.createElement('li');
    const btn= document.createElement('button');
    btn.textContent = book;
    btn.className   = 'w-full text-left px-4 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none';
    btn.addEventListener('click', () => toggleChapters(book, li));
    li.appendChild(btn);
    ul.appendChild(li);
  });
  c.appendChild(ul);
}

function toggleChapters(book, li) {
  let sub = li.querySelector('ul');
  if (sub) return sub.classList.toggle('hidden');
  sub = document.createElement('ul'); sub.className='pl-6 space-y-1';
  const cnt = manifest[book] || 0;
  for (let i=1; i<=cnt; i++) {
    const entry = document.createElement('li'),
          w     = document.createElement('div'),
          btn   = document.createElement('button');
    w.className = 'px-4 py-1 hover:bg-gray-200 dark:hover:bg-gray-700';
    btn.textContent = i;
    btn.className   = 'text-left w-full focus:outline-none';
    btn.addEventListener('click', () => fetchAndRenderChapter(book, String(i)));
    w.appendChild(btn); entry.appendChild(w); sub.appendChild(entry);
  }
  li.appendChild(sub);
}

// === RENDER: Chapter Content ===
async function fetchAndRenderChapter(book, chap) {
  currentBook = book; currentChap = chap;
  const center = document.getElementById('center-panel');
  center.innerHTML = '<p class="italic">Loading…</p>';
  try {
    const res = await fetch(
      `https://api.esv.org/v3/passage/text/?q=${encodeURIComponent(book+' '+chap)}`,
      { headers: { Authorization: `Token ${ESV_API_KEY}` } }
    );
    const js = await res.json();
    let raw = (js.passages?.[0]||'').replace(/\*/g,'');
    const lines = raw.split('\n').map(l=>l.trim()).filter(Boolean);
    center.innerHTML = '';
    for (const line of lines) {
      const m = line.match(/^([0-9]+)\s*(.*)$/);
      if (m) {
        const p = document.createElement('p');
        p.className = 'mb-2';
        p.innerHTML = `<sup class="font-semibold">${m[1]}</sup> ${m[2]}`;
        center.appendChild(p);
      } else {
        const h = document.createElement('h3');
        h.className = 'font-semibold my-2';
        h.textContent = line;
        center.appendChild(h);
      }
    }
  } catch (err) {
    console.error(err);
    center.textContent = '⚠️ Failed to load passage.';
  }
}

// === RENDER: Outline Tab ===
function renderOutlineTab(book, chap) {
  const out = document.getElementById('tab-content');
  const d   = manualOutlineData[book]?.chapters?.[chap]?._outline;
  if (!d) { out.textContent = 'No outline items yet…'; return; }
  let html = `<h2 class="font-semibold mb-2">${d.title}
                <span class="text-sm text-gray-500">(${d.range})</span></h2>`;
  d.items.forEach(item => {
    html += `<p class="font-medium">${item.text}` +
            (item.verse?` <span class="text-xs text-gray-400">(v. ${item.verse})</span>`:'') +
            `</p>`;
    if (item.subpoints.length) {
      html += '<ul class="list-disc pl-6 mb-2">';
      item.subpoints.forEach(sp => html += `<li class="text-sm">${sp}</li>`);
      html += '</ul>';
    }
  });
  out.innerHTML = html;
}

// === RENDER: Manuscript Tab ===
function renderManuscriptTab(book, chap) {
  const out = document.getElementById('tab-content');
  const d   = manualManuscriptData[book]?.chapters?.[chap]?._manuscript;
  if (!d) { out.textContent = 'No manuscript entry yet…'; return; }
  out.innerHTML =
    `<h2 class="font-semibold mb-2">${d.title} 
      <span class="text-sm text-gray-500">(${d.range})</span></h2>` +
    `<textarea disabled rows="8" class="w-full p-2 bg-gray-100 dark:bg-gray-800 
      text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
      ${d.content}
    </textarea>`;
}

// === RENDER: Commentary Tab ===
function renderCommentaryTab(book, chap) {
  const out = document.getElementById('tab-content');
  const d   = manualCommentaryData[book]?.chapters?.[chap]?._commentary;
  if (!d) { out.textContent = 'No commentary yet…'; return; }
  out.innerHTML =
    `<h2 class="font-semibold mb-2">${d.title} 
      <span class="text-sm text-gray-500">(${d.range})</span></h2>` +
    `<textarea disabled rows="8" class="w-full p-2 bg-gray-100 dark:bg-gray-800 
      text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
      ${d.content}
    </textarea>`;
}

// === DRAWER LOGIC ===
function initDrawerLogic() {
  document.getElementById('btn-open-outline')
    .addEventListener('click', () => openDrawer('outline'));
  document.getElementById('btn-open-manuscript')
    .addEventListener('click', () => openDrawer('manuscript'));
  document.getElementById('btn-open-commentary')
    .addEventListener('click', () => openDrawer('commentary'));
  document.getElementById('btn-close-drawer')
    .addEventListener('click', closeDrawer);
}

function openDrawer(type) {
  const drawer = document.getElementById('slide-drawer');
  drawer.classList.remove('translate-x-full');
  if (type === 'outline')      renderOutlineForm();
  else if (type === 'manuscript') renderManuscriptForm();
  else                           renderCommentaryForm();
}

function closeDrawer() {
  document.getElementById('slide-drawer').classList.add('translate-x-full');
}

// === FORM: Outline ===
function renderOutlineForm() {
  const titleEl = document.getElementById('drawer-title');
  const bodyEl  = document.getElementById('drawer-body');
  titleEl.textContent = 'New Outline';
  bodyEl.innerHTML = `
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
      Book: <strong>${currentBook}</strong> • Chapter: <strong>${currentChap}</strong>
    </p>`;
  const inputCls = 'w-full p-2 mb-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600';
  const ti = Object.assign(document.createElement('input'), { type:'text', placeholder:'Outline Title…', className:inputCls });
  const ri = Object.assign(document.createElement('input'), { type:'text', placeholder:'Verse Range…', className:inputCls });
  const pc = document.createElement('div'); pc.id='outline-points'; pc.className='space-y-4 mb-4';
  bodyEl.append(ti, ri, pc);

  const addPt = document.createElement('button');
  addPt.type='button'; addPt.textContent='＋ Add Main Point';
  addPt.className='px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 mb-4';
  addPt.addEventListener('click',() => {
    const pd = document.createElement('div');
    pd.className='p-3 border rounded space-y-2 bg-gray-50 dark:bg-gray-700';
    const lbl = Object.assign(document.createElement('input'),{ type:'text', placeholder:'Main point…', className:inputCls });
    const vrs = Object.assign(document.createElement('input'),{ type:'text', placeholder:'Verse (opt)…', className:inputCls });
    const sc = document.createElement('div'); sc.className='pl-4 space-y-2';
    const addSc = document.createElement('button');
    addSc.type='button'; addSc.textContent='＋ Sub-point'; addSc.className='text-sm text-indigo-600';
    addSc.addEventListener('click',() => {
      const si = Object.assign(document.createElement('input'),{ type:'text', placeholder:'Sub-point…', className:inputCls });
      sc.appendChild(si);
    });
    pd.append(lbl, vrs, addSc, sc);
    pc.appendChild(pd);
  });
  bodyEl.appendChild(addPt);

  const footer = document.createElement('div'); footer.className='flex justify-end space-x-2';
  const btnCancel = document.createElement('button');
  btnCancel.type='button'; btnCancel.textContent='Cancel'; btnCancel.className='px-4 py-2 bg-gray-300 rounded hover:bg-gray-400';
  btnCancel.addEventListener('click', closeDrawer);

  const btnSave = document.createElement('button');
  btnSave.type='button'; btnSave.textContent='Save Outline'; btnSave.className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700';
  btnSave.addEventListener('click', () => {
    const items = Array.from(pc.children).map(div => {
      const [tIn,rIn] = div.querySelectorAll('input');
      const subs = Array.from(div.querySelectorAll('.pl-4 input')).map(i=>i.value.trim()).filter(Boolean);
      return { text:tIn.value.trim(), verse:rIn.value.trim(), subpoints:subs };
    });
    manualOutlineData[currentBook] ??= { chapters:{} };
    const bk = manualOutlineData[currentBook];
    bk.chapters      ??= {};
    bk.chapters[currentChap] = { _outline:{ title: ti.value.trim(), range: ri.value.trim(), items } };
    saveAll(); closeDrawer(); renderOutlineTab(currentBook, currentChap);
  });
  footer.append(btnCancel, btnSave);
  bodyEl.appendChild(footer);
}

// === FORM: Manuscript ===
function renderManuscriptForm() {
  const titleEl = document.getElementById('drawer-title');
  const bodyEl  = document.getElementById('drawer-body');
  titleEl.textContent = 'New Manuscript';
  bodyEl.innerHTML = `
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
      Book: <strong>${currentBook}</strong> • Chapter: <strong>${currentChap}</strong>
    </p>`;
  const inputCls = 'w-full p-2 mb-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600';
  const ti  = Object.assign(document.createElement('input'), { type:'text', placeholder:'Manuscript Title…', className:inputCls });
  const ri  = Object.assign(document.createElement('input'), { type:'text', placeholder:'Verse Range…', className:inputCls });
  const ta  = document.createElement('textarea'); ta.placeholder='Content…'; ta.rows=8; ta.className=inputCls;
  bodyEl.append(ti, ri, ta);

  const footer = document.createElement('div'); footer.className='flex justify-end space-x-2';
  const btnCancel = document.createElement('button');
  btnCancel.type='button'; btnCancel.textContent='Cancel'; btnCancel.className='px-4 py-2 bg-gray-300 rounded hover:bg-gray-400';
  btnCancel.addEventListener('click', closeDrawer);

  const btnSave = document.createElement('button');
  btnSave.type='button'; btnSave.textContent='Save Manuscript'; btnSave.className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700';
  btnSave.addEventListener('click', () => {
    manualManuscriptData[currentBook] ??= { chapters:{} };
    const bk = manualManuscriptData[currentBook];
    bk.chapters      ??= {};
    bk.chapters[currentChap] = {
      _manuscript: {
        title:   ti.value.trim(),
        range:   ri.value.trim(),
        content: ta.value.trim()
      }
    };
    saveAll(); closeDrawer(); renderManuscriptTab(currentBook, currentChap);
  });

  footer.append(btnCancel, btnSave);
  bodyEl.appendChild(footer);
}

// === FORM: Commentary ===
function renderCommentaryForm() {
  const titleEl = document.getElementById('drawer-title');
  const bodyEl  = document.getElementById('drawer-body');
  titleEl.textContent = 'New Commentary';
  bodyEl.innerHTML = `
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
      Book: <strong>${currentBook}</strong> • Chapter: <strong>${currentChap}</strong>
    </p>`;
  const inputCls = 'w-full p-2 mb-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600';
  const ti  = Object.assign(document.createElement('input'), { type:'text', placeholder:'Commentary Title…', className:inputCls });
  const ri  = Object.assign(document.createElement('input'), { type:'text', placeholder:'Verse Range…', className:inputCls });
  const ta  = document.createElement('textarea'); ta.placeholder='Commentary…'; ta.rows=8; ta.className=inputCls;
  bodyEl.append(ti, ri, ta);

  const footer = document.createElement('div'); footer.className='flex justify-end space-x-2';
  const btnCancel = document.createElement('button');
  btnCancel.type='button'; btnCancel.textContent='Cancel'; btnCancel.className='px-4 py-2 bg-gray-300 rounded hover:bg-gray-400';
  btnCancel.addEventListener('click', closeDrawer);

  const btnSave = document.createElement('button');
  btnSave.type='button'; btnSave.textContent='Save Commentary'; btnSave.className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700';
  btnSave.addEventListener('click', () => {
    manualCommentaryData[currentBook] ??= { chapters:{} };
    const bk = manualCommentaryData[currentBook];
    bk.chapters      ??= {};
    bk.chapters[currentChap] = {
      _commentary: {
        title:   ti.value.trim(),
        range:   ri.value.trim(),
        content: ta.value.trim()
      }
    };
    saveAll(); closeDrawer(); renderCommentaryTab(currentBook, currentChap);
  });

  footer.append(btnCancel, btnSave);
  bodyEl.appendChild(footer);
}
