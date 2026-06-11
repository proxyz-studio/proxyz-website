(function () {
  var LINE_URL = 'https://line.me/R/ti/p/%40518tylfg';

  function injectLineContact() {
    if (document.querySelector('.floating-contact-rail')) return;

    var style = document.createElement('style');
    style.id = 'proxyz-line-floating-contact-style';
    style.textContent = [
      '.floating-contact-rail{position:fixed;right:max(20px,env(safe-area-inset-right));bottom:max(22px,env(safe-area-inset-bottom));z-index:2147483000;display:flex;flex-direction:column;gap:12px;pointer-events:none}',
      '.floating-contact-button{width:58px;height:58px;display:grid;place-items:center;color:#ff4193;text-decoration:none;pointer-events:auto;border:1px solid rgba(255,65,147,.66);border-radius:999px;background:radial-gradient(circle at 35% 25%,rgba(255,65,147,.22),transparent 34px),rgba(10,10,10,.78);box-shadow:0 0 0 1px rgba(255,255,255,.06) inset,0 0 22px rgba(255,65,147,.20),0 18px 46px rgba(0,0,0,.54);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);transition:transform .18s ease,color .18s ease,border-color .18s ease,box-shadow .18s ease,background .18s ease}',
      '.floating-contact-button svg{width:31px;height:31px;display:block}',
      '.floating-contact-button:hover{color:#fff;transform:translateY(-3px) scale(1.03);border-color:rgba(255,65,147,.98);background:radial-gradient(circle at 35% 25%,rgba(255,65,147,.36),transparent 36px),rgba(15,15,15,.92);box-shadow:0 0 0 1px rgba(255,255,255,.09) inset,0 0 30px rgba(255,65,147,.36),0 20px 54px rgba(0,0,0,.62)}',
      '.floating-contact-button:focus-visible{outline:2px solid #ff4193;outline-offset:5px}',
      '@media(max-width:640px){.floating-contact-rail{right:max(14px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));gap:10px}.floating-contact-button{width:52px;height:52px}.floating-contact-button svg{width:28px;height:28px}}',
      '@media print{.floating-contact-rail{display:none}}',
    ].join('');

    var rail = document.createElement('nav');
    rail.className = 'floating-contact-rail';
    rail.setAttribute('aria-label', 'Quick contact');
    rail.innerHTML =
      '<a href="' + LINE_URL + '" class="floating-contact-button floating-contact-button--line" aria-label="Open PROXYZ on LINE" title="Open PROXYZ on LINE" target="_blank" rel="noopener noreferrer">' +
      '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">' +
      '<path fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.7" d="M16 5.25c-6.35 0-11.5 4.12-11.5 9.2 0 4.55 4.14 8.34 9.58 9.08.37.08.66.4.66.78v1.98c0 .47.55.73.92.43l2.92-2.36c5.1-.88 8.92-4.52 8.92-8.91 0-5.08-5.15-9.2-11.5-9.2Z"></path>' +
      '<text x="16" y="17.25" fill="currentColor" font-family="Arial, sans-serif" font-size="5.6" font-weight="800" letter-spacing="0.25" text-anchor="middle">LINE</text>' +
      '</svg>' +
      '</a>';

    document.head.appendChild(style);
    document.body.appendChild(rail);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectLineContact);
  } else {
    injectLineContact();
  }
})();
