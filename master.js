document.addEventListener('DOMContentLoaded', () => {
  const allDetails = Array.from(document.querySelectorAll('details'));
  let isMobile = window.innerWidth <= 768;

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

  function initMobile() {
    const wrapper = document.querySelector('.accordion-wrapper');
    let scrollTimeout;

    function updateActiveCard() {
      const scrollLeft = wrapper.scrollLeft;
      const wrapperWidth = wrapper.clientWidth;
      const wrapperCenter = wrapperWidth / 2;
      const allCards = wrapper.querySelectorAll('details');
      
      let activeCard = null;
      let minDistance = Infinity;
      
      allCards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();
        const cardCenter = cardRect.left - wrapperRect.left + cardRect.width / 2;
        const distance = Math.abs(cardCenter - wrapperCenter);
        
        if (distance < minDistance) {
          minDistance = distance;
          activeCard = card;
        }
      });
      
      allCards.forEach(card => {
        card.classList.remove('active', 'animate-in');
        card.open = false;
      });
      
      if (activeCard) {
        activeCard.classList.add('active');
        activeCard.open = true;
        activeCard.classList.add('animate-in');
      }
    }

    wrapper.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateActiveCard, 50);
    });

    allDetails.forEach(detail => {
      detail.addEventListener('click', (e) => {
        e.preventDefault();
        detail.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest', 
          inline: 'center' 
        });
      });
    });

    // Set initial active card
    const interactionCard = allDetails.find(card => card.id === 'interaction');
    if (interactionCard) {
      interactionCard.scrollIntoView({ 
        behavior: 'auto', 
        block: 'nearest', 
        inline: 'center' 
      });
    }
    
    setTimeout(updateActiveCard, 100);
  }

  function handleResize() {
    const newIsMobile = window.innerWidth <= 768;
    if (newIsMobile !== isMobile) {
      isMobile = newIsMobile;
      
      allDetails.forEach(detail => {
        detail.classList.remove('active', 'animate-in');
        detail.open = false;
      });

      if (isMobile) {
        initMobile();
      } else {
        initDesktop();
      }
    }
  }

  if (isMobile) {
    initMobile();
  } else {
    initDesktop();
  }

  window.addEventListener('resize', handleResize);
});