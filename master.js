(function() {
  const items = document.querySelectorAll('details[name="accordion"]');
  items.forEach((el) => {
    el.addEventListener('toggle', () => {
      if (el.open) {
        // close others
        //items.forEach((other) => { if (other !== el) other.open = false; });
      } else {
        // prevent closing all
        const anyOpen = Array.from(items).some(item => item.open);
        if (!anyOpen) {
          //el.open = true;
        }
      }
    });
  });
})();