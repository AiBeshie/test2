document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     HELPERS
  ========================= */
  const $ = (q) => document.querySelector(q);
  const $$ = (q) => document.querySelectorAll(q);

  const CONFETTI_COLORS = ["#ff6b6b","#feca57","#48dbfb","#1dd1a1","#5f27cd"];

  /* =========================
     BACKGROUND MUSIC
  ========================= */
  const bgMusic = $("#bgMusic");
  if (bgMusic) bgMusic.volume = 0.3;

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
  if (saveDateBtn) saveDateBtn.addEventListener("click", () => {
    const title = "Wedding of A & S";
    const location = "Mary, Mother of Good Counsel Parish Church";
    const description = "We invite you to celebrate our wedding";
    const start = new Date("June 20, 2027 08:00:00 UTC");
    const end = new Date("June 20, 2027 12:00:00 UTC");

    const formatDate = d => d.toISOString().replace(/[-:]|\.\d{3}/g,"");
    const gCalURL = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatDate(start)}/${formatDate(end)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
    window.open(gCalURL,"_blank");

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
  if (window.AOS) AOS.init({ duration: 1000, once: true, easing: "ease-out-cubic" });

  /* =========================
     MOBILE NAV LABELS
  ========================= */
  if (window.innerWidth <= 480) {
    $$(".nav-bottom .nav__links a").forEach(link => {
      const label = link.querySelector("span");
      if (!label) return;
      label.style.transition = "none";
      label.style.opacity = "1";
      label.style.transform = "translateY(0)";
      label.style.position = "static";
      label.style.bottom = "auto";
      label.style.background = "none";
      label.style.padding = "0";
      label.style.whiteSpace = "normal";
    });
  }

  /* =========================
     RSVP FORM + CONFETTI
  ========================= */
  function launchRSVPConfetti() {
    for (let i=0;i<35;i++){
      const piece = document.createElement("span");
      const size = Math.random()*4+6; // 6-10px
      piece.style.cssText = `position: fixed; left: ${Math.random()*100}vw; top: -10px; width: ${size}px; height: ${size}px; border-radius: 50%; background: ${CONFETTI_COLORS[Math.floor(Math.random()*CONFETTI_COLORS.length)]}; z-index: 9999; pointer-events: none;`;
      piece.animate([{ transform: "translateY(0) rotate(0)", opacity: 1 }, { transform: `translateY(300px) rotate(${Math.random()*540+180}deg)`, opacity: 0 }], { duration: 2200, easing: "ease-out", fill: "forwards" });
      document.body.appendChild(piece);
      setTimeout(()=>piece.remove(),2300);
    }
  }

  const rsvpForm = $(".rsvp-form");
  if (rsvpForm) rsvpForm.addEventListener("submit", async e => {
    e.preventDefault();
    const payload = new URLSearchParams({
      name: rsvpForm.name.value,
      attendance: rsvpForm.attendance.value,
      message: rsvpForm.message.value
    });
    try {
      const res = await fetch("https://script.google.com/macros/s/AKfycbyMtejkOuP4GFjI2ubPV3DEmubOiLoxrASm7nWUBS6fZv5FRqd2RbMm217IZwoGPV-7/exec", { method:"POST", body: payload });
      const result = await res.json();
      if (result.status === "success") {
        rsvpForm.reset();
        launchRSVPConfetti();
        alert("RSVP submitted! 💜");
      } else alert("Submission failed. Please try again.");
    } catch(err) {
      alert("Network error. Please try again later.");
    }
  });

  /* =========================
     LOCAL PRENUP SLIDESHOW
  ========================= */
  const prenupGallery = $("#prenup-gallery");
  if (prenupGallery){
    const images = [
      "assets/prenup/1.jpg",
      "assets/prenup/2.jpg",
      "assets/prenup/3.jpg",
      "assets/prenup/4.jpg" // Add more images as needed
    ];
    let currentIndex = 0;

    function showImage(index){
      prenupGallery.innerHTML = `<figure><img src="${images[index]}" alt="Prenup Photo" loading="lazy"></figure>`;
    }

    showImage(currentIndex);

    // Auto-slide every 4 seconds
    setInterval(()=>{
      currentIndex = (currentIndex + 1) % images.length;
      showImage(currentIndex);
    }, 4000);
  }

});
