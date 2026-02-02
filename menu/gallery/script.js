/* ==================================================
   GALLERY JS — GOOGLE DRIVE + LIGHTBOX + PAGINATION
================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ==================================================
     HELPERS
  ================================================== */
  const $ = (q) => document.querySelector(q);
  const $$ = (q) => document.querySelectorAll(q);

  /* ==================================================
     CONFIG
  ================================================== */
  const folders = { 
    church: "16BPBMPTwZwZgTI2tnNV1Tk1EKKB4wMyv", 
    prenup: "1ZoSsPSECRq062Bx4KAhKQUtnj24ePRAn", 
    reception: "1FqqNku0QNhGgWMJAiec6944SVjXeAZ4i" 
  };
  const apiKey = "AIzaSyBgEstYNO3_dKI4mC1KdsPRpx_p2gpDsXQ";
  const sectionMap = { church: "church-gallery", prenup: "prenup-gallery", reception: "reception-gallery" };
  const PHOTOS_PER_PAGE = 6;
  const PLACEHOLDER = "https://via.placeholder.com/400x400/c0c0c0/ffffff?text=Upload+Here";

  /* ==================================================
     FETCH IMAGES FROM DRIVE
  ================================================== */
  async function fetchImages(folderId) {
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType contains 'image/'&fields=files(id,name,thumbnailLink)&key=${apiKey}`);
      const data = await res.json();
      return data.files || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  /* ==================================================
     PAGINATION UTILITY
  ================================================== */
  function paginate(files) {
    const pages = [];
    for (let i = 0; i < files.length; i += PHOTOS_PER_PAGE) {
      const slice = files.slice(i, i + PHOTOS_PER_PAGE);
      while (slice.length < PHOTOS_PER_PAGE) slice.push({ name: "Placeholder", thumbnailLink: PLACEHOLDER });
      pages.push(slice);
    }
    return pages;
  }

  /* ==================================================
     LOAD GALLERY INTO DOM
  ================================================== */
  async function loadGallery(key) {
    const wrapper = $(`#${sectionMap[key]}`);
    if (!wrapper) return;

    const pagination = $(`#${key}-pagination`);
    const prevBtn = pagination?.querySelector(".prev");
    const nextBtn = pagination?.querySelector(".next");

    const files = await fetchImages(folders[key]);
    const pages = paginate(files);
    let currentPage = 0;

    function renderPage() {
      wrapper.innerHTML = "";
      pages[currentPage].forEach(file => {
        const fig = document.createElement("figure");
        fig.dataset.id = file.id || "";
        fig.dataset.name = file.name || "Photo";
        fig.innerHTML = `<img src="${file.thumbnailLink || PLACEHOLDER}" loading="lazy" alt="Wedding Photo">`;
        wrapper.appendChild(fig);
      });
    }

    renderPage();

    prevBtn?.addEventListener("click", () => {
      currentPage = (currentPage - 1 + pages.length) % pages.length;
      renderPage();
    });

    nextBtn?.addEventListener("click", () => {
      currentPage = (currentPage + 1) % pages.length;
      renderPage();
    });
  }

  /* ==================================================
     LIGHTBOX / DRIVE PREVIEW
  ================================================== */
  let currentGallery = [], currentIndex = 0;
  const popup = $("#drivePopup");
  const frame = $("#driveFrame");
  const caption = $("#driveCaption");

  // Share buttons
  const shareBtn = document.createElement("button");
  shareBtn.className = "drive-share";
  shareBtn.textContent = "⇪";
  popup.appendChild(shareBtn);

  const sharePopup = document.createElement("div");
  sharePopup.className = "share-popup";
  sharePopup.innerHTML = `
    <a href="#" target="_blank" class="share-facebook">Facebook</a>
    <a href="#" target="_blank" class="share-twitter">Twitter</a>
    <a href="#" target="_blank" class="share-instagram">Instagram</a>
    <a href="#" target="_blank" class="share-tiktok">TikTok</a>
  `;
  popup.appendChild(sharePopup);

  shareBtn.addEventListener("click", e => {
    e.stopPropagation();
    sharePopup.style.display = sharePopup.style.display === "flex" ? "none" : "flex";
  });

  popup.addEventListener("click", e => {
    if (!e.target.closest(".drive-share") && !e.target.closest(".share-popup")) sharePopup.style.display = "none";
  });

  function updateShareLinks(fileId, fileName) {
    const url = `https://drive.google.com/uc?id=${fileId}&export=view`;
    sharePopup.querySelector(".share-facebook").href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    sharePopup.querySelector(".share-twitter").href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(fileName)}`;
    sharePopup.querySelector(".share-instagram").href = `https://www.instagram.com/?url=${encodeURIComponent(url)}`;
    sharePopup.querySelector(".share-tiktok").href = `https://www.tiktok.com/upload?url=${encodeURIComponent(url)}`;
  }

  function openDrivePreview(fileId, title, galleryArray) {
    currentGallery = galleryArray;
    currentIndex = galleryArray.findIndex(f => f.id === fileId);
    frame.src = `https://drive.google.com/file/d/${fileId}/preview`;
    caption.textContent = title;
    updateShareLinks(fileId, title);
    popup.style.display = "flex";
    popup.style.opacity = 0;
    popup.style.transform = "translateY(20%)";
    requestAnimationFrame(() => { popup.style.opacity = 1; popup.style.transform = "translateY(0)"; });
  }

  function closeDrivePreview() {
    popup.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    popup.style.opacity = 0;
    popup.style.transform = "translateY(20%)";
    setTimeout(() => { frame.src = ""; popup.style.display = "none"; }, 300);
  }

  function slideToImage(newIndex, direction = 1) {
    if (!currentGallery.length) return;
    const next = currentGallery[newIndex];
    if (!next?.id) return;

    const oldFrame = frame.cloneNode();
    oldFrame.src = frame.src;
    oldFrame.style.position = "absolute";
    oldFrame.style.top = "0";
    oldFrame.style.left = "0";
    oldFrame.style.width = "100%";
    oldFrame.style.height = "100%";
    oldFrame.style.transition = "transform 0.3s ease, opacity 0.3s ease";
    oldFrame.style.zIndex = "10";
    popup.appendChild(oldFrame);

    oldFrame.style.transform = `translateX(${-direction * 100}%) scale(0.95)`;
    oldFrame.style.opacity = "0";

    frame.style.transition = "none";
    frame.style.transform = `translateX(${direction * 50}px) scale(0.95)`;
    frame.style.opacity = "0";
    frame.src = `https://via.placeholder.com/800x600/c0c0c0/ffffff?text=Loading...`;

    const img = new Image();
    img.src = `https://drive.google.com/file/d/${next.id}/preview`;
    img.onload = () => {
      frame.src = img.src;
      caption.textContent = next.name;
      updateShareLinks(next.id, next.name);

      frame.style.transition = "transform 0.3s ease, opacity 0.3s ease";
      frame.style.transform = "translateX(0) scale(1)";
      frame.style.opacity = "1";

      setTimeout(() => oldFrame.remove(), 350);
    };

    currentIndex = newIndex;
  }

  function showNext() { slideToImage((currentIndex + 1) % currentGallery.length, 1); }
  function showPrev() { slideToImage((currentIndex - 1 + currentGallery.length) % currentGallery.length, -1); }

  $(".drive-prev")?.addEventListener("click", showPrev);
  $(".drive-next")?.addEventListener("click", showNext);
  $(".drive-close")?.addEventListener("click", closeDrivePreview);

  popup?.addEventListener("click", e => { if (e.target.id === "drivePopup") closeDrivePreview(); });

  document.addEventListener("keydown", e => {
    if (popup.style.display !== "flex") return;
    if (e.key === "Escape") closeDrivePreview();
    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
  });

  document.addEventListener("click", e => {
    const fig = e.target.closest(".gallery-wrapper figure");
    if (!fig) return;
    const galleryWrapper = fig.closest(".gallery-wrapper");
    const figures = Array.from(galleryWrapper.querySelectorAll("figure"));
    const galleryArray = figures.map(f => ({ id: f.dataset.id, name: f.dataset.name }));
    openDrivePreview(fig.dataset.id, fig.dataset.name, galleryArray);
  });

  /* ==================================================
     TOUCH SWIPE
  ================================================== */
  let touchStartX = 0, touchStartY = 0, isDragging = false;
  let lastTouchTime = 0, lastTouchX = 0;
  const swipeThreshold = 50, verticalThreshold = 30, swipeVelocityThreshold = 0.3;

  popup?.addEventListener("touchstart", e => {
    if (e.target.closest(".drive-close, .drive-prev, .drive-next, .drive-download, .drive-share")) return;
    const t = e.changedTouches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    lastTouchX = t.clientX;
    lastTouchTime = e.timeStamp;
    isDragging = true;
    frame.style.transition = "none";
  });

  popup?.addEventListener("touchmove", e => {
    if (!isDragging) return;
    const t = e.changedTouches[0];
    const diffX = t.clientX - touchStartX;
    const diffY = t.clientY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      frame.style.transform = `translateX(${diffX}px) scale(0.95)`;
    }
  });

  popup?.addEventListener("touchend", e => {
    if (!isDragging) return;
    isDragging = false;
    const t = e.changedTouches[0];
    const diffX = t.clientX - touchStartX;
    const diffY = t.clientY - touchStartY;
    const timeDiff = e.timeStamp - lastTouchTime;
    const velocity = (t.clientX - lastTouchX) / timeDiff;

    if (Math.abs(diffX) > Math.abs(diffY) && (Math.abs(diffX) > swipeThreshold || Math.abs(velocity) > swipeVelocityThreshold)) {
      diffX < 0 ? showNext() : showPrev();
    } else if (Math.abs(diffY) > swipeThreshold && Math.abs(diffX) < verticalThreshold) {
      popup.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      popup.style.transform = `translateY(${diffY}px)`; 
      popup.style.opacity = 0;
      setTimeout(() => closeDrivePreview(), 300);
    } else {
      frame.style.transition = "transform 0.3s cubic-bezier(0.25, 1.5, 0.5, 1)";
      frame.style.transform = "translateX(0) scale(1)";
    }
  });

  /* ==================================================
     DOWNLOAD BUTTON
  ================================================== */
  $(".drive-download")?.addEventListener("click", async () => {
    if (!currentGallery.length) return;
    const current = currentGallery[currentIndex];
    if (!current?.id) return;
    const url = `https://www.googleapis.com/drive/v3/files/${current.id}?alt=media&key=${apiKey}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Network error");
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = current.name || "photo.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Failed to download. Please try again.");
      console.error(err);
    }
  });

  /* ==================================================
     INIT ALL GALLERIES
  ================================================== */
  Object.keys(folders).forEach(loadGallery);

});
