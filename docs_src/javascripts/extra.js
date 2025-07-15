document.addEventListener("DOMContentLoaded", () => {
    const modal = document.createElement("div");
    modal.id = "imageModal";
    modal.className = "modal";
    const closeBtn = document.createElement("span");
    closeBtn.className = "modal-close";
    closeBtn.innerHTML = "&times;";
    modal.appendChild(closeBtn);
    const modalImg = document.createElement("img");
    modalImg.className = "modal-content";
    modal.appendChild(modalImg);
    const caption = document.createElement("div");
    caption.id = "modalCaption";
    caption.className = "modal-caption";
    modal.appendChild(caption);
    document.body.appendChild(modal);
    function _blockScroll(e) { e.preventDefault() }
    function _blockNavKeys(e) {
        const blockKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "PageUp", "PageDown", "Home", "End", "Tab", " "];
        if (blockKeys.includes(e.key)) e.preventDefault()
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
        modal.style.display = "flex";
        modalImg.src = src;
        caption.textContent = alt || "";
        enableModalInputLock();
    }
    function closeModal() {
        modal.style.display = "none";
        disableModalInputLock();
    }
    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", e => { if (e.target === modal) closeModal() });
    document.querySelectorAll("img.preview").forEach(img => {
        img.style.cursor = "pointer";
        img.addEventListener("click", () => openModal(img.src, img.alt));
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal() });
});

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.md-tag').forEach(span => {
        const tag = span.textContent.toLowerCase();
        const link = document.createElement('a');
         link.href = `${window.location.origin}/docs/tags/#tag:${tag}`;
        link.className = span.className + ' md-tag-icon';
        link.innerHTML = span.innerHTML;
        span.replaceWith(link);
    });
});