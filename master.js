document.addEventListener('DOMContentLoaded', () => {
  const allDetails = Array.from(document.querySelectorAll('details'));
  let isMobile = window.innerWidth <= 1000;
  
  const cardOrder = ['interaction', 'dialogue', 'inventory', 'director', 'launcher', 'dialoguer', 'inventoryManager', 'buildTool'];

  async function loadDesktopCards() {
    const wrapper = document.querySelector('.accordion-wrapper');
    wrapper.innerHTML = '';
    
    for (const cardId of cardOrder) {
      try {
        const response = await fetch(`pages/${cardId}.html`);
        const html = await response.text();
        wrapper.insertAdjacentHTML('beforeend', html);
      } catch (error) {
        console.error(`Failed to load ${cardId}:`, error);
      }
    }
    
    const loadedDetails = Array.from(document.querySelectorAll('details'));
    allDetails.splice(0, allDetails.length, ...loadedDetails);
    initDesktop();
  }

  function initDesktop() {
    allDetails.forEach(detail => {
      detail.addEventListener('toggle', () => {
        if (detail.open) {
          allDetails.forEach(other => {
            if (other !== detail && other.open) {
              other.open = false;
            }
          });
        }

        detail.classList.remove('animate-in');
        if (detail.open) {
          void detail.offsetWidth;
          detail.classList.add('animate-in');
        }
      });
    });
  }

  function handleResize() {
    const newIsMobile = window.innerWidth <= 1000;
    if (newIsMobile !== isMobile) {
      isMobile = newIsMobile;
      location.reload();
    }
  }

  if (!isMobile) {
    loadDesktopCards();
  }

  window.addEventListener('resize', handleResize);
});