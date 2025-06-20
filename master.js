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
    
    function updateActiveCard() {
      const wrapperRect = wrapper.getBoundingClientRect();
      const wrapperCenter = wrapperRect.left + wrapperRect.width / 2;
      
      let closestCard = null;
      let minDistance = Infinity;
      
      allDetails.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(cardCenter - wrapperCenter);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestCard = card;
        }
      });
      
      allDetails.forEach(card => {
        card.classList.remove('active', 'animate-in');
        card.open = false;
      });
      
      if (closestCard) {
        closestCard.classList.add('active');
        closestCard.open = true;
        closestCard.classList.add('animate-in');
      }
    }

    wrapper.addEventListener('scroll', () => {
      updateActiveCard();
    });

    allDetails.forEach(detail => {
      detail.addEventListener('click', (e) => {
        if (e.target.closest('.btn')) {
          return;
        }
        e.preventDefault();
        detail.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      });
    });

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn');
      if (btn && btn.href) {
        e.stopPropagation();
        //window.open(btn.href, '_blank');
      }
    });

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
      location.reload();
    }
  }

  if (isMobile) {
    initMobile();
  } else {
    initDesktop();
  }

  window.addEventListener('resize', handleResize);
});