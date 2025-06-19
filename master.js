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
    const originalCards = [...allDetails];
    const totalCards = originalCards.length;
    const clonesCount = 3;

    function cloneCards() {
      for (let i = 0; i < clonesCount; i++) {
        originalCards.forEach(card => {
          const cloneBefore = card.cloneNode(true);
          const cloneAfter = card.cloneNode(true);
          wrapper.insertBefore(cloneBefore, wrapper.firstChild);
          wrapper.appendChild(cloneAfter);
        });
      }
    }

    function getCardWidth() {
      const allCards = wrapper.querySelectorAll('details');
      if (allCards.length === 0) return window.innerWidth * 0.7;
      
      const cardStyle = getComputedStyle(allCards[0]);
      const wrapperStyle = getComputedStyle(wrapper);
      return parseFloat(cardStyle.width) + parseFloat(wrapperStyle.gap);
    }

    function updateActiveCard() {
      const scrollLeft = wrapper.scrollLeft;
      const cardWidth = getCardWidth();
      const wrapperCenter = wrapper.clientWidth / 2;
      const allCards = wrapper.querySelectorAll('details');
      
      let closestIndex = 0;
      let closestDistance = Infinity;
      
      allCards.forEach((card, index) => {
        const cardLeft = index * cardWidth;
        const cardCenter = cardLeft + cardWidth / 2;
        const distance = Math.abs(cardCenter - (scrollLeft + wrapperCenter));
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      
      allCards.forEach((card, index) => {
        card.classList.remove('active', 'animate-in');
        card.open = false;
        
        if (index === closestIndex) {
          card.classList.add('active');
          card.open = true;
          card.classList.add('animate-in');
        }
      });
    }

    function handleInfiniteScroll() {
      const cardWidth = getCardWidth();
      const totalWidth = cardWidth * totalCards;
      const currentScroll = wrapper.scrollLeft;
      const scrollWidth = wrapper.scrollWidth;
      const clientWidth = wrapper.clientWidth;
      
      if (currentScroll <= cardWidth) {
        wrapper.scrollLeft = currentScroll + totalWidth;
      } else if (currentScroll >= scrollWidth - clientWidth - cardWidth) {
        wrapper.scrollLeft = currentScroll - totalWidth;
      }
    }

    wrapper.addEventListener('scroll', () => {
      handleInfiniteScroll();
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateActiveCard, 100);
    });

    cloneCards();
    const cardWidth = getCardWidth();
    const allCards = wrapper.querySelectorAll('details');
    
    allCards.forEach((detail, index) => {
      detail.addEventListener('click', (e) => {
        e.preventDefault();
        wrapper.scrollTo({
          left: index * cardWidth,
          behavior: 'smooth'
        });
      });
    });
    
    const interactionIndex = Array.from(allCards).findIndex(card => card.id === 'interaction');
    
    if (interactionIndex !== -1) {
      wrapper.scrollLeft = interactionIndex * cardWidth;
    } else {
      wrapper.scrollLeft = clonesCount * totalCards * cardWidth;
    }

    allCards.forEach((detail, index) => {
      detail.addEventListener('click', (e) => {
        e.preventDefault();
        wrapper.scrollTo({
          left: index * cardWidth,
          behavior: 'smooth'
        });
      });
    });
    
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