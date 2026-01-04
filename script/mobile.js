const MobileCardLoader = {
  cardOrder: ['interaction', 'dialogue', 'inventory', 'director', 'launcher', 'dialoguer', 'inventoryManager', 'buildTool'],
  allDetails: [],
  
  async init() {
    await this.loadAllCards();
    this.initMobileLogic();
  },

  async loadAllCards() {
    const wrapper = document.querySelector('.accordion-wrapper');
    wrapper.innerHTML = '';
    
    for (const cardId of this.cardOrder) {
      try {
        const response = await fetch(`pages/${cardId}.html`);
        const html = await response.text();
        wrapper.insertAdjacentHTML('beforeend', html);
      } catch (error) {
        console.error(`Failed to load ${cardId}:`, error);
      }
    }
    
    this.allDetails = Array.from(document.querySelectorAll('details'));
  },

  initMobileLogic() {
    const wrapper = document.querySelector('.accordion-wrapper');

    const updateActiveCard = () => {
      const wrapperRect = wrapper.getBoundingClientRect();
      const wrapperCenter = wrapperRect.left + wrapperRect.width / 2;

      let closestCard = null;
      let minDistance = Infinity;

      this.allDetails.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(cardCenter - wrapperCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestCard = card;
        }
      });

      this.allDetails.forEach(card => {
        card.classList.remove('active', 'animate-in');
        card.open = false;
      });

      if (closestCard) {
        closestCard.classList.add('active');
        closestCard.open = true;
        closestCard.classList.add('animate-in');
      }
    };

    wrapper.addEventListener('scroll', updateActiveCard);

    this.allDetails.forEach(detail => {
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
      }
    });

    const interactionCard = this.allDetails.find(card => card.id === 'interaction');
    if (interactionCard) {
      interactionCard.scrollIntoView({
        behavior: 'auto',
        block: 'nearest',
        inline: 'center'
      });
    }

    setTimeout(updateActiveCard, 100);

    const contactBox = document.getElementById('contactBox');
    contactBox.addEventListener('click', function (e) {
      e.stopPropagation();
      this.classList.toggle('expanded');
    });
    
    document.addEventListener('click', function () {
      contactBox.classList.remove('expanded');
    });
    
    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach(item => {
      item.addEventListener('click', function (e) {
        e.stopPropagation();
      });
    });
  }
};

if (window.innerWidth <= 1000) {
  document.addEventListener('DOMContentLoaded', () => {
    MobileCardLoader.init();
  });
}