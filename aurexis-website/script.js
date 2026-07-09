const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const waitlistForm = document.querySelector("#waitlistForm");
const formNote = document.querySelector("#formNote");
const waitlistSubmitButton = waitlistForm?.querySelector("button[type='submit']");

const GOOGLE_SHEET_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxebvNy_eYAweVIjcFgSmpw-2GZQ7yOpwm709akfLZb86UI26RkDyxweBPJz_I30kN7/exec";
const SUBMISSION_TIMEOUT_MS = 15000;

const saveLocalWaitlistBackup = (submission) => {
  const saved = JSON.parse(localStorage.getItem("aurexisWaitlist") || "[]");

  saved.push(submission);
  localStorage.setItem("aurexisWaitlist", JSON.stringify(saved));
};

if (waitlistForm && formNote) {
  waitlistForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(waitlistForm);
    const submission = {
      ...Object.fromEntries(formData.entries()),
      submittedAt: new Date().toISOString()
    };

    saveLocalWaitlistBackup(submission);

    if (!GOOGLE_SHEET_WEB_APP_URL) {
      waitlistForm.reset();
      formNote.textContent = "Thank you. Your early access request has been saved locally. Add your Google Apps Script web app URL in script.js to send it to Google Sheets.";
      return;
    }

    formNote.textContent = "Sending your application...";
    if (waitlistSubmitButton) {
      waitlistSubmitButton.disabled = true;
      waitlistSubmitButton.textContent = "Sending...";
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), SUBMISSION_TIMEOUT_MS);

    try {
      await fetch(GOOGLE_SHEET_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(submission),
        signal: controller.signal
      });

      waitlistForm.reset();
      formNote.textContent = "Thank you. Your early access request has been sent to the Aurexis waitlist.";
    } catch (error) {
      formNote.textContent = "Your request was saved locally, but Google Sheets did not respond. Please check the Apps Script deployment and try again.";
    } finally {
      window.clearTimeout(timeoutId);

      if (waitlistSubmitButton) {
        waitlistSubmitButton.disabled = false;
        waitlistSubmitButton.textContent = "Apply to Join";
      }
    }
  });
}
