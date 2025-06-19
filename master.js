document.addEventListener('DOMContentLoaded', () => {
  const allDetails = Array.from(document.querySelectorAll('details'));

  allDetails.forEach(detail => {
    detail.addEventListener('toggle', () => {
      if (detail.open) {
        // Close any other open details
        allDetails.forEach(other => {
          if (other !== detail && other.open) {
            other.open = false;
          }
        });
      }

      // Handle animation class
      detail.classList.remove('animate-in');
      if (detail.open) {
        void detail.offsetWidth;
        detail.classList.add('animate-in');
      }
    });
  });
});
