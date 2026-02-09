

document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     HELPERS
  ========================= */
  const $ = q => document.querySelector(q);
  const $$ = q => document.querySelectorAll(q);
  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  const CONFETTI_COLORS = ["#ff6b6b","#feca57","#48dbfb","#1dd1a1","#5f27cd"];

/* =========================
   BACKGROUND MUSIC
========================= */
const bgMusic = $("#bgMusic");

if (bgMusic) {
  function fadeIn(audio) {
    audio.volume = 0;
    audio.play();
    let vol = 0;
    const fade = setInterval(() => {
      if (vol < 0.3) {
        vol += 0.02;
        audio.volume = vol;
      } else clearInterval(fade);
    }, 120);
  }

  function startMusic() {
    fadeIn(bgMusic);
    document.removeEventListener("click", startMusic);
    document.removeEventListener("touchstart", startMusic);
  }

  document.addEventListener("click", startMusic);
  document.addEventListener("touchstart", startMusic);
}


  /* =========================
     COUNTDOWN TIMER
  ========================= */
  const targetDate = new Date("June 20, 2027 00:00:00").getTime();
  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;
    const days = Math.floor(distance / (1000*60*60*24));
    const hours = Math.floor((distance % (1000*60*60*24)) / (1000*60*60));
    const minutes = Math.floor((distance % (1000*60*60)) / (1000*60));
    const seconds = Math.floor((distance % (1000*60)) / 1000);
    $("#daysNumber").innerText = days > 0 ? days : 0;
    $("#hoursNumber").innerText = hours < 10 ? "0"+hours : hours;
    $("#minutesNumber").innerText = minutes < 10 ? "0"+minutes : minutes;
    $("#secondsNumber").innerText = seconds < 10 ? "0"+seconds : seconds;
  }
  setInterval(updateCountdown, 1000);
  updateCountdown();

  /* =========================
     SAVE THE DATE
  ========================= */
  const saveDateBtn = $("#saveDateBtn");
  if(saveDateBtn) saveDateBtn.addEventListener("click", () => {
    const title = "Wedding of A & S";
    const location = "Mary, Mother of Good Counsel Parish Church";
    const description = "We invite you to celebrate our wedding";
    const start = new Date("June 20, 2027 08:00:00 UTC");
    const end = new Date("June 20, 2027 12:00:00 UTC");
    const formatDate = d => d.toISOString().replace(/[-:]|\.\d{3}/g,"");

    // Google Calendar
    const gCalURL = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatDate(start)}/${formatDate(end)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
    window.open(gCalURL,"_blank");

    // ICS download
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${title}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
LOCATION:${location}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR`;
    const blob = new Blob([icsContent], { type: "text/calendar" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "SaveTheDate.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  });

  /* =========================
     AOS INIT
  ========================= */
  if(window.AOS) AOS.init({ duration:1000, once:true, easing:"ease-out-cubic" });

  /* =========================
     MOBILE NAV LABELS
  ========================= */
  if(window.innerWidth <= 480){
    $$(".nav-bottom .nav__links a").forEach(link=>{
      const label = link.querySelector("span");
      if(!label) return;
      Object.assign(label.style,{
        transition:"none",
        opacity:"1",
        transform:"translateY(0)",
        position:"static",
        bottom:"auto",
        background:"none",
        padding:"0",
        whiteSpace:"normal"
      });
    });
  }
/* =========================
   RSVP FORM + CONFETTI
========================= */
function launchRSVPConfetti(){
  for(let i=0;i<35;i++){
    const piece = document.createElement("span");
    const size = Math.random() * 4 + 6; // 6-10px
    piece.style.cssText = `position:fixed; left:${Math.random()*100}vw; top:-10px; width:${size}px; height:${size}px; border-radius:50%; background:${["#ff6b6b","#feca57","#48dbfb","#1dd1a1","#5f27cd"][Math.floor(Math.random()*5)]}; z-index:9999; pointer-events:none;`;
    piece.animate(
      [{ transform:"translateY(0) rotate(0)", opacity:1 }, 
       { transform:`translateY(300px) rotate(${Math.random()*540+180}deg)`, opacity:0 }],
      { duration:2200, easing:"ease-out", fill:"forwards" }
    );
    document.body.appendChild(piece);
    setTimeout(()=>piece.remove(),2300);
  }
}

const rsvpForm = document.querySelector(".rsvp-form");
const rsvpStatus = document.getElementById("rsvpMessageStatus");
const attendanceSelect = document.getElementById("rsvpAttendance");
const guestInput = document.getElementById("rsvpGuests");

if (attendanceSelect && guestInput) {
  // Disable guests if declines
  function toggleGuests() {
    if (attendanceSelect.value === "declines") {
      guestInput.value = 0;
      guestInput.disabled = true;
      guestInput.required = false;
    } else {
      guestInput.disabled = false;
      guestInput.required = true;
      if (!guestInput.value || guestInput.value == 0) guestInput.value = 1;
    }
  }
  attendanceSelect.addEventListener("change", toggleGuests);
  toggleGuests();
}

if (rsvpForm && rsvpStatus) {
  rsvpForm.addEventListener("submit", async e => {
    e.preventDefault();

    // Validate guests if not declining
    if (attendanceSelect.value !== "declines" && (!guestInput.value || guestInput.value < 1)) {
      rsvpStatus.textContent = "Please enter number of guests.";
      rsvpStatus.style.color = "#ff6b6b";
      rsvpStatus.style.opacity = 1;
      return;
    }

    // Show loading message
    rsvpStatus.textContent = "Sending...";
    rsvpStatus.style.opacity = 1;
    rsvpStatus.style.color = "#1d274b";

    const payload = new URLSearchParams({
      name: rsvpForm.name.value,
      attendance: attendanceSelect.value,
      guests: guestInput.value,
      message: rsvpForm.message.value
    });

    try {
      const res = await fetch(
        "https://script.google.com/macros/s/AKfycbyNnZyFs-OTBO1zJIkxvDdLRyXP5P-xdFk8cgbA-6d3hn2HMXFcLHkXzgfAtZNlEjSn/exec",
        { method: "POST", body: payload }
      );

      const result = await res.json();

      if (result.status === "success") {
        rsvpForm.reset();
        toggleGuests(); // Reset guest input state
        launchRSVPConfetti();

        rsvpStatus.textContent = "RSVP submitted! 💜";
        rsvpStatus.style.color = "#d95fbc";

        setTimeout(() => { rsvpStatus.style.opacity = 0; }, 5000);
      } else {
        rsvpStatus.textContent = "Submission failed. Please try again.";
        rsvpStatus.style.color = "#ff6b6b";
      }
    } catch (err) {
      rsvpStatus.textContent = "Network error. Please try again later.";
      rsvpStatus.style.color = "#ff6b6b";
    }
  });
}

  /* =========================
     PRENUP GALLERY SLIDESHOW
  ========================= */
  const prenupGallery = $("#prenup-gallery");
  const PHOTOS_FOLDER = "assets/prenup/";
  const PHOTOS = ["1.jpg","2.jpg","3.jpg","4.jpg","5.jpg","6.jpg","7.jpg","8.jpg"]; // Add your prenup images here
  let currentSlide = 0;

  function renderPrenup(){
    if(!prenupGallery) return;
    prenupGallery.innerHTML = PHOTOS.map((src,i)=>`<img src="${PHOTOS_FOLDER}${src}" class="${i===0?'active':''}" loading="lazy" alt="Prenup Photo">`).join("");
    // Dots
    const dotsContainer = document.createElement("div");
    dotsContainer.id="prenup-dots";
    PHOTOS.forEach((_,i)=>{
      const dot = document.createElement("span");
      if(i===0) dot.classList.add("active");
      dot.addEventListener("click",()=>{ goToSlide(i); resetAutoplay(); });
      dotsContainer.appendChild(dot);
    });
    prenupGallery.after(dotsContainer);
  }

  function goToSlide(index){
    const imgs = prenupGallery.querySelectorAll("img");
    const dots = $("#prenup-dots").querySelectorAll("span");
    imgs.forEach((img,i)=> img.classList.toggle("active", i===index));
    dots.forEach((dot,i)=> dot.classList.toggle("active", i===index));
    currentSlide = index;
  }

  function nextSlide(){ goToSlide((currentSlide+1)%PHOTOS.length); }
  let autoplay = setInterval(nextSlide, 6000);
  function resetAutoplay(){ clearInterval(autoplay); autoplay = setInterval(nextSlide,4000); }

  renderPrenup();

/* =========================
   DETAILS MAP POPUP (2 hotspots)
========================= */
const mapModal = document.getElementById("mapModal");
const mapFrame = document.getElementById("mapFrame");
const mapTitle = document.getElementById("mapTitle");
const mapAddress = document.getElementById("mapAddress");
const closeMap = document.getElementById("closeMap");
const mapButtons = document.querySelectorAll(".map-hotspot");

const mapData = {
  ceremony: {
    title: "📍 Ceremony",
    address: `Mary, Mother of Good Counsel Parish<br>
              Peach Street, Marcelo Green Village, Parañaque City, Metro Manila<br>
              <a href="https://www.google.com/maps/place/Mary,+Mother+of+Good+Counsel+Parish+Church" target="_blank">View on Google Maps</a>`,
    src: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10201.083379577898!2d121.02932810783388!3d14.477099163985272!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397cfa9f6d78d7d%3A0x4f91183a6be3af0c!2sMary%2C%20Mother%20of%20Good%20Counsel%20Parish%20Church%20-%20Marcelo%20Green%20Village%2C%20Marcelo%20Green%2C%20Para%C3%B1aque%20City%20(Diocese%20of%20Para%C3%B1aque)!5e1!3m2!1sen!2sph!4v1770565978649!5m2!1sen!2sph"
  },
  reception: {
    title: "🍽️ Reception",
    address: `The Narra Tree Clubhouse<br>
              Parañaque, Metro Manila<br>
              <a href="https://www.google.com/maps/place/The+Narra+Tree+Clubhouse" target="_blank">View on Google Maps</a>`,
    src: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10201.083379577898!2d121.02932810783388!3d14.477099163985272!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397cf36e13bcfff%3A0xf1e71c8ca60d00c9!2sThe%20Narra%20Tree%20Clubhouse!5e1!3m2!1sen!2sph!4v1770566016665!5m2!1sen!2sph"
  }
};

mapButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.map; // "ceremony" or "reception"
    mapTitle.innerHTML = mapData[key].title;
    mapAddress.innerHTML = mapData[key].address;
    mapFrame.src = mapData[key].src;
    mapModal.style.display = "flex";
    document.body.style.overflow = "hidden"; // prevent background scroll
  });
});

closeMap.addEventListener("click", () => {
  mapModal.style.display = "none";
  mapFrame.src = "";
  document.body.style.overflow = "auto";
});

window.addEventListener("click", e => {
  if(e.target === mapModal){
    mapModal.style.display = "none";
    mapFrame.src = "";
    document.body.style.overflow = "auto";
  }
});









const INV_IMAGES = ["1.jpg","2.jpg","3.jpg","4.jpg","5.jpg","6.jpg"];

const viewAllBtn = document.getElementById("viewAllBtn");
const invPopup = document.getElementById("invitationPopup");
const invPopupClose = document.getElementById("invitationPopupClose");
const popupGallery = document.getElementById("popupGallery");

// Fullscreen overlay
let invFull = document.getElementById("invFullScreen");
if(!invFull){
  invFull = document.createElement("div");
  invFull.id = "invFullScreen";
  invFull.style.cssText = "display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);justify-content:center;align-items:center;z-index:10000;flex-direction:column;";
  document.body.appendChild(invFull);

  const img = document.createElement("img");
  img.id = "invFullImg";
  img.style.cssText = "max-width:90%;max-height:80%;border-radius:12px;margin-bottom:12px;transition:transform 0.3s;";
  invFull.appendChild(img);

  const closeBtn = document.createElement("span");
  closeBtn.id = "invFullClose";
  closeBtn.textContent = "×";
  closeBtn.style.cssText = "position:absolute;top:20px;right:30px;font-size:2rem;color:#fff;cursor:pointer;";
  invFull.appendChild(closeBtn);

  const prevBtn = document.createElement("button");
  prevBtn.id = "invPrev";
  prevBtn.textContent = "<";
  prevBtn.style.cssText = "position:absolute;left:20px;top:50%;transform:translateY(-50%);font-size:2rem;color:#fff;background:none;border:none;cursor:pointer;";
  invFull.appendChild(prevBtn);

  const nextBtn = document.createElement("button");
  nextBtn.id = "invNext";
  nextBtn.textContent = ">";
  nextBtn.style.cssText = "position:absolute;right:20px;top:50%;transform:translateY(-50%);font-size:2rem;color:#fff;background:none;border:none;cursor:pointer;";
  invFull.appendChild(nextBtn);
}

const invFullImg = document.getElementById("invFullImg");
const invFullClose = document.getElementById("invFullClose");
const invPrev = document.getElementById("invPrev");
const invNext = document.getElementById("invNext");

let fullIndex = 0;

// Open gallery popup
viewAllBtn?.addEventListener("click", () => {
  popupGallery.innerHTML = INV_IMAGES.map((img,i)=>`<img src="assets/invitation/${img}" data-index="${i}">`).join("");
  invPopup.style.display = "flex";
  document.body.style.overflow = "hidden";
});

// Close gallery popup
invPopupClose?.addEventListener("click", () => {
  invPopup.style.display = "none";
  document.body.style.overflow = "auto";
});

// Click outside popup to close
invPopup?.addEventListener("click", e => {
  if(e.target === invPopup){
    invPopup.style.display = "none";
    document.body.style.overflow = "auto";
  }
});

// Click thumbnail → open fullscreen
popupGallery.addEventListener("click", e => {
  if(e.target.tagName === "IMG"){
    fullIndex = parseInt(e.target.dataset.index);
    openFull(fullIndex);
  }
});

// Fullscreen open function
function openFull(idx){
  fullIndex = (idx + INV_IMAGES.length) % INV_IMAGES.length;
  invFullImg.src = `assets/invitation/${INV_IMAGES[fullIndex]}`;
  invFull.style.display = "flex";
  document.body.style.overflow = "hidden";
}

// Fullscreen close
invFullClose?.addEventListener("click", () => {
  invFull.style.display = "none";
  document.body.style.overflow = "auto";
});

// Fullscreen click outside image closes
invFull?.addEventListener("click", e => {
  if(e.target === invFull) invFull.style.display = "none";
});

// Navigation
invPrev?.addEventListener("click", () => openFull(fullIndex-1));
invNext?.addEventListener("click", () => openFull(fullIndex+1));

// Keyboard navigation
document.addEventListener("keydown", e => {
  if(invFull.style.display === "flex"){
    if(e.key === "Escape") invFull.style.display = "none";
    if(e.key === "ArrowLeft") invPrev?.click();
    if(e.key === "ArrowRight") invNext?.click();
  }
});

/* =========================
   DETAILS VIDEO SCROLL AUTOPLAY (REPEATABLE)
========================= */
const detailsVideo = document.getElementById("detailsVideo");

if (detailsVideo) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // nasa screen → play
        detailsVideo.play().catch(() => {});
      } else {
        // wala sa screen → pause + reset sa start
        detailsVideo.pause();
        detailsVideo.currentTime = 0;
      }
    });
  }, {
    threshold: 0.6 // 60% visible bago mag-play (mas smooth sa phone)
  });

  observer.observe(detailsVideo);
}

  /* =========================
     TOUCH SWIPE
  ========================= */
  let touchStartX=0,touchStartY=0,touchEndX=0,touchEndY=0, swipeThreshold=50;
  popup?.addEventListener("touchstart",e=>{ touchStartX=e.changedTouches[0].screenX; touchStartY=e.changedTouches[0].screenY; });
  popup?.addEventListener("touchend",e=>{
    touchEndX=e.changedTouches[0].screenX;
    touchEndY=e.changedTouches[0].screenY;
    const diffX=touchEndX-touchStartX, diffY=touchEndY-touchStartY;
    if(Math.abs(diffX)>Math.abs(diffY) && Math.abs(diffX)>swipeThreshold) diffX<0?showNext():showPrev();
    else if(Math.abs(diffY)>Math.abs(diffX) && Math.abs(diffY)>swipeThreshold){
      const dir=diffY<0?-1:1;
      popup.style.transition="opacity 0.3s ease, transform 0.3s ease";
      popup.style.transform=`translateY(${dir*100}%)`;
      popup.style.opacity=0;
      setTimeout(closePreview,300);
    }
  });

});
