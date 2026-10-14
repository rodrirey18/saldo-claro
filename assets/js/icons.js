'use strict';
/** Iconos SVG propios de Saldo Claro. Sin emojis ni bibliotecas externas. */
const PATHS={
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
 list:'<path d="M9 6h12M9 12h12M9 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01" stroke-width="3" stroke-linecap="round"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/><path d="M12 12 20 4"/>',
 settings:'<path d="M10 2h4l.7 2.3 1.9.8 2.1-1.1 2.8 2.8-1.1 2.1.8 1.9L23 11v4l-2.3.7-.8 1.9 1.1 2.1-2.8 2.8-2.1-1.1-1.9.8L14 24h-4l-.7-2.3-1.9-.8-2.1 1.1-2.8-2.8 1.1-2.1-.8-1.9L1 15v-4l2.3-.7.8-1.9L3 6.3l2.8-2.8 2.1 1.1 1.9-.8z" transform="translate(1 0) scale(.92)"/><circle cx="12" cy="12" r="3"/>',
 user:'<circle cx="12" cy="8" r="3.4"/><path d="M5 21v-2.2a7 7 0 0 1 14 0V21"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
 chevron:'<path d="m9 18 6-6-6-6"/>', back:'<path d="m15 18-6-6 6-6"/>', down:'<path d="m6 9 6 6 6-6"/>',
 plus:'<path d="M12 5v14M5 12h14"/>', close:'<path d="M5 5 19 19M19 5 5 19"/>', dots:'<circle cx="5" cy="12" r=".9"/><circle cx="12" cy="12" r=".9"/><circle cx="19" cy="12" r=".9"/>',
 eye:'<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/>', eyeoff:'<path d="M3 3 21 21M9.8 6.3A11.3 11.3 0 0 1 12 6c6.5 0 10 6 10 6a16 16 0 0 1-3.2 3.7M6.2 7.5C3.4 9.5 2 12 2 12s3.5 6 10 6c1.4 0 2.6-.3 3.7-.8"/>',
 income:'<path d="M12 3v17m-7-7 7 7 7-7"/>', expense:'<path d="M12 21V4M5 11l7-7 7 7"/>',
 pig:'<path d="M6 10a7 7 0 0 1 11-3l4-1v5a5.8 5.8 0 0 1 0 5l-3 1v3h-3v-2H9v2H6v-3a7 7 0 0 1 0-7z"/><circle cx="17" cy="11" r=".6"/><path d="M6 12H3v3h3M10 6 9 3"/>',
 card:'<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20M6 15h5"/>', cash:'<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M5 8h1M18 16h1"/>',
 briefcase:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18M10 12v2h4v-2"/>',
 laptop:'<rect x="4" y="4" width="16" height="13" rx="2"/><path d="m2 20 2-3h16l2 3H2z"/>', plane:'<path d="m21 3-7 18-3-8-8-3zM11 13l10-10"/>',
 book:'<path d="M12 6c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V5c-4-1-7-1-10 1zM12 6v15"/>',
 gift:'<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M2 9h20M12 9v12M12 9c-5 0-7-1-7-4a3 3 0 0 1 6 0l1 4zm0 0c5 0 7-1 7-4a3 3 0 0 0-6 0l-1 4z"/>',
 car:'<path d="m5 11 2-6h10l2 6M4 11h16v8H4zM7 19v2M17 19v2M7 15h2M15 15h2"/>',
 shield:'<path d="m12 2 9 4v6c0 6-4 9-9 11-5-2-9-5-9-11V6z"/><path d="m8 12 3 3 5-6"/>',
 screen:'<rect x="3" y="3" width="18" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
 music:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
 dumbbell:'<path d="M3 9v6M6 6v12M9 10v4M15 10v4M18 6v12M21 9v6M9 12h6"/>',
 cart:'<path d="M2 3h3l3 13h12l2-10H6M8 20h.01M19 20h.01"/>',
 receipt:'<path d="M5 3h14v18l-3-2-4 2-4-2-3 2zM8 8h8M8 12h8"/>',
 coins:'<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v4c0 4 14 4 14 0V6M5 10v4c0 4 14 4 14 0v-4M5 14v4c0 4 14 4 14 0v-4"/>',
 transfer:'<path d="M3 8h17m-4-4 4 4-4 4M21 16H4m4-4-4 4 4 4"/>',
 search:'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>', edit:'<path d="m4 17-1 4 4-1L20 7l-4-4zM14 5l5 5"/>', trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v7M14 11v7"/>',
 clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>', download:'<path d="M12 3v13m-5-5 5 5 5-5M4 18v3h16v-3"/>',
 upload:'<path d="M12 20V7m-5 5 5-5 5 5M4 6V3h16v3"/>', flag:'<path d="M5 22V3m0 1c7-4 7 4 15 0v11c-8 4-8-4-15 0"/>',
 check:'<path d="m4 13 5 5L20 6"/>', info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v6M12 7v.2"/>', lock:'<rect x="4" y="10" width="16" height="12" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
 refresh:'<path d="M20 7A9 9 0 0 0 4 8M4 3v5h5M4 17a9 9 0 0 0 16-1M20 21v-5h-5"/>',
 wallet:'<path d="M3 6h16v5M3 6v14h18v-9H3zM16 14h5v4h-5a2 2 0 1 1 0-4z"/>'
};
function ico(name, size=22){return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[name]||PATHS.target}</svg>`}
function tile(name,tone='aqua',small=false){return `<span class="icon-tile ${tone==='aqua'?'':tone}${small?' small':''}">${ico(name,small?20:24)}</span>`}
