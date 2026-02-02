/* ==================================================
   RSVP CONFETTI + FORM — CLEANED VERSION
================================================== */

document.addEventListener("DOMContentLoaded", () => {

  // ================= HELPERS =================
  const $ = (q) => document.querySelector(q);
  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // ================= CONFETTI COLORS =================
  const cssVars = getComputedStyle(document.documentElement);
  const CONFETTI_COLORS = [
    cssVars.getPropertyValue("--clr-secondary")?.trim() || "#9b779d",
    cssVars.getPropertyValue("--clr-accent")?.trim() || "#c9907c",
    cssVars.getPropertyValue("--clr-soft")?.trim() || "#f3e4e1"
  ];

  // ================= RSVP CONFETTI =================
  function launchRSVPConfetti() {
    const COUNT = 35;
    for (let i = 0; i < COUNT; i++) {
      const piece = document.createElement("span");
      const size = rand(6, 10);
      piece.style.cssText = `
        position: fixed;
        left: ${rand(0, 100)}vw;
        top: -10px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${pick(CONFETTI_COLORS)};
        z-index: 9999;
        pointer-events: none;
      `;
      piece.animate(
        [
          { transform: "translateY(0) rotate(0deg)", opacity: 1 },
          { transform: `translateY(300px) rotate(${rand(180, 720)}deg)`, opacity: 0 }
        ],
        { duration: 2200, easing: "ease-out", fill: "forwards" }
      );
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 2300);
    }
  }

  // ================= RSVP FORM SUBMISSION =================
  const rsvpForm = $(".rsvp-form");
  const rsvpSuccess = $("#rsvpSuccess");
  if (!rsvpForm || !rsvpSuccess) return;

  const submitBtn = rsvpForm.querySelector("button[type=submit]");

  rsvpForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Show loading state
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Sending...";

    const payload = new URLSearchParams({
      name: rsvpForm.name.value,
      attendance: rsvpForm.attendance.value,
      message: rsvpForm.message.value
    });

    try {
      const res = await fetch(
        "https://script.google.com/macros/s/AKfycbyMtejkOuP4GFjI2ubPV3DEmubOiLoxrASm7nWUBS6fZv5FRqd2RbMm217IZwoGPV-7/exec",
        { method: "POST", body: payload }
      );
      const result = await res.json();

      if (result.status === "success") {
        rsvpForm.reset();
        launchRSVPConfetti();

        // Show success message
        rsvpSuccess.classList.add("show");
        setTimeout(() => rsvpSuccess.classList.remove("show"), 5000);
      } else {
        rsvpSuccess.textContent = "Submission failed. Please try again.";
        rsvpSuccess.classList.add("show");
        setTimeout(() => rsvpSuccess.classList.remove("show"), 5000);
      }

    } catch (err) {
      rsvpSuccess.textContent = "Network error. Please try again later.";
      rsvpSuccess.classList.add("show");
      setTimeout(() => rsvpSuccess.classList.remove("show"), 5000);
      console.error("RSVP fetch error:", err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });

});
