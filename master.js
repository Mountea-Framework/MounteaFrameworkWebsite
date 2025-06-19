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

    function cloneCards() {
      originalCards.forEach(card => {
        const cloneBefore = card.cloneNode(true);
        const cloneAfter = card.cloneNode(true);
        wrapper.insertBefore(cloneBefore, wrapper.firstChild);
        wrapper.appendChild(cloneAfter);
      });
    }

    function updateActiveCard() {
      const scrollLeft = wrapper.scrollLeft;
      const cardWidth = window.innerWidth * 0.7;
      const allCards = wrapper.querySelectorAll('details');
      const centerIndex = Math.round(scrollLeft / cardWidth);
      const originalIndex = centerIndex % totalCards;
      
      allCards.forEach(card => {
        card.classList.remove('active', 'animate-in');
        card.open = false;
      });
      
      if (allCards[centerIndex]) {
        allCards[centerIndex].classList.add('active');
        allCards[centerIndex].open = true;
        allCards[centerIndex].classList.add('animate-in');
      }
    }

    function handleInfiniteScroll() {
      const cardWidth = window.innerWidth * 0.7;
      const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
      const currentScroll = wrapper.scrollLeft;
      
      if (currentScroll <= cardWidth) {
        wrapper.scrollLeft = currentScroll + (totalCards * cardWidth);
      } else if (currentScroll >= maxScroll - cardWidth) {
        wrapper.scrollLeft = currentScroll - (totalCards * cardWidth);
      }
    }

    wrapper.addEventListener('scroll', () => {
      handleInfiniteScroll();
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateActiveCard, 150);
    });

    originalCards.forEach((detail, index) => {
      detail.addEventListener('click', (e) => {
        e.preventDefault();
        const cardWidth = window.innerWidth * 0.7;
        const currentScroll = wrapper.scrollLeft;
        const currentCenter = Math.round(currentScroll / cardWidth);
        const targetScroll = currentCenter * cardWidth + (index - (currentCenter % totalCards)) * cardWidth;
        
        wrapper.scrollTo({
          left: targetScroll,
          behavior: 'smooth'
        });
      });
    });

    cloneCards();
    const cardWidth = window.innerWidth * 0.7;
    wrapper.scrollLeft = totalCards * cardWidth;
    updateActiveCard();
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
