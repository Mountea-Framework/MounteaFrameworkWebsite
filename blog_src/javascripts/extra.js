(function () {
  const modal = document.createElement("div");
  modal.id = "imageModal";
  modal.className = "modal";

  const closeBtn = document.createElement("span");
  closeBtn.className = "modal-close";
  closeBtn.innerHTML = "×";
  modal.appendChild(closeBtn);

  const modalImg = document.createElement("img");
  modalImg.className = "modal-content";
  modal.appendChild(modalImg);

  const caption = document.createElement("div");
  caption.id = "modalCaption";
  caption.className = "modal-caption";
  modal.appendChild(caption);

  document.body.appendChild(modal);

  function _blockScroll(e) {
    e.preventDefault();
  }

  function _blockNavKeys(e) {
    const keys = [
      "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
      "PageUp", "PageDown", "Home", "End", "Tab", " "
    ];
    if (keys.includes(e.key)) {
      e.preventDefault();
    }
  }

  function enableModalInputLock() {
    document.body.style.overflow = "hidden";
    window.addEventListener("wheel", _blockScroll, { passive: false });
    window.addEventListener("touchmove", _blockScroll, { passive: false });
    document.addEventListener("keydown", _blockNavKeys, true);
  }

  function disableModalInputLock() {
    document.body.style.overflow = "";
    window.removeEventListener("wheel", _blockScroll, { passive: false });
    window.removeEventListener("touchmove", _blockScroll, { passive: false });
    document.removeEventListener("keydown", _blockNavKeys, true);
  }

  function openModal(src, alt) {
    modalImg.src = src;
    caption.textContent = alt || "";
    modal.classList.add("open");
    enableModalInputLock();
  }

  function closeModal() {
    modal.classList.remove("open");
    disableModalInputLock();
  }

  document.addEventListener("click", e => {
    if (e.target === closeBtn || e.target === modal) {
      closeModal();
    } else if (e.target.matches("img.preview")) {
      openModal(e.target.src, e.target.alt);
    }
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeModal();
    }
  });
})();

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.md-tag').forEach(span => {
    const tag = span.textContent.toLowerCase();
    const link = document.createElement('a');
    link.href = `${window.location.origin}/docs/tags/#tag:${tag}`;
    link.className = `${span.className} md-tag-icon`;
    link.innerHTML = span.innerHTML;
    span.replaceWith(link);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const patch = () => {
    document.querySelectorAll('rect.basic.label-container')
      .forEach(r => { r.setAttribute('rx','8'); });
  };
  patch();
  new MutationObserver(patch).observe(document.body, { childList: true, subtree: true });
});
