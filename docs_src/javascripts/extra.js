(() => {
  'use strict';

  const GA_MEASUREMENT_ID = 'G-5Z7M76TSZK';

  function injectGA() {
    if (![...document.scripts].some(s => s.src && s.src.includes('googletagmanager.com/gtag/js'))) {
      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(gaScript);
    }
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = window.gtag || gtag;
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    injectGA();
  } else {
    document.addEventListener('DOMContentLoaded', injectGA, { once: true });
  }

  const modal = document.createElement('div');
  modal.id = 'imageModal';
  modal.className = 'modal';

  const closeBtn = document.createElement('span');
  closeBtn.className = 'modal-close';
  closeBtn.textContent = '×';
  modal.appendChild(closeBtn);

  const modalImg = document.createElement('img');
  modalImg.className = 'modal-content';
  modal.appendChild(modalImg);

  const caption = document.createElement('div');
  caption.id = 'modalCaption';
  caption.className = 'modal-caption';
  modal.appendChild(caption);

  document.body.appendChild(modal);

  function blockScroll(e) { e.preventDefault(); }
  function blockNavKeys(e) {
    const keys = [
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'PageUp', 'PageDown', 'Home', 'End', 'Tab', ' '
    ];
    if (keys.includes(e.key)) { e.preventDefault(); }
  }

  function enableModalInputLock() {
    document.body.style.overflow = 'hidden';
    window.addEventListener('wheel', blockScroll, { passive: false });
    window.addEventListener('touchmove', blockScroll, { passive: false });
    document.addEventListener('keydown', blockNavKeys, true);
  }

  function disableModalInputLock() {
    document.body.style.overflow = '';
    window.removeEventListener('wheel', blockScroll, { passive: false });
    window.removeEventListener('touchmove', blockScroll, { passive: false });
    document.removeEventListener('keydown', blockNavKeys, true);
  }

  function openModal(src, alt = '') {
    modalImg.src = src;
    caption.textContent = alt;
    modal.classList.add('open');
    enableModalInputLock();
  }

  function closeModal() {
    modal.classList.remove('open');
    disableModalInputLock();
  }

  document.addEventListener('click', e => {
    if (e.target === closeBtn || e.target === modal) {
      closeModal();
    } else if (e.target.matches('img.preview')) {
      openModal(e.target.src, e.target.alt);
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); }
  });

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.md-tag').forEach(span => {
      const tag = span.textContent.trim().toLowerCase();
      const link = document.createElement('a');
      link.href = `${window.location.origin}/docs/tags/#tag:${tag}`;
      link.className = `${span.className} md-tag-icon`;
      link.innerHTML = span.innerHTML;
      span.replaceWith(link);
    });
  });

  document.addEventListener('DOMContentLoaded', () => {
    const patch = () => {
      document.querySelectorAll('rect.basic.label-container').forEach(r => r.setAttribute('rx', '8'));
    };
    patch();
    new MutationObserver(patch).observe(document.body, { childList: true, subtree: true });
  });

})();
