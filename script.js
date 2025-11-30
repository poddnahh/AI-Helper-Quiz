// ===== SIMPLE QUIZ LOGIC (Q1 + Q4 only) =====

// Quiz answers we care about
const quizState = {
  category: null,   // from Q1: productivity | creative | learning | bundle
  experience: null, // from Q2 (not used for logic, just stored)
  format: null,     // from Q3 (not used for logic)
  budget: null      // from Q4: low | mid | bundle
};

let currentStep = 1;
const totalSteps = 4;

// Main sections
const quizSection = document.getElementById("quiz-section");
const resultSection = document.getElementById("result-section");

// Buttons / controls
const startQuizBtn = document.getElementById("start-quiz-btn");
const backBtn = document.getElementById("back-btn");
const stripBundleBtn = document.getElementById("strip-bundle-btn");

// Progress UI
const progressText = document.getElementById("progress-text");
const progressFill = document.getElementById("progress-fill");
const quizSteps = Array.from(document.querySelectorAll(".quiz-step"));

// Result heading / intro
const resultHeading = document.getElementById("result-heading");
const resultIntro = document.getElementById("result-intro");

// Result cards
const singleCard = document.getElementById("single-card");
const bundleCard = document.getElementById("bundle-card");

// Primary product elements (single toolkit)
const primaryBuyBtn = document.getElementById("primary-buy-btn");

// Bundle elements
const bundleBuyBtn = document.getElementById("bundle-buy-btn");
const bundlePriceEl = document.getElementById("bundle-price");
const bundleFormatEl = document.getElementById("bundle-format");

// Modal elements
const upsellModal = document.getElementById("upsell-modal");
const modalCloseBtn = document.getElementById("modal-close-btn");
const modalUpgradeBundleBtn = document.getElementById("modal-upgrade-bundle-btn");
const modalKeepSingleBtn = document.getElementById("modal-keep-single-btn");

// Product data (add your real checkout URLs here)
const productData = {
  productivity: {
    name: "AI Productivity Playbook",
    tagline: "Turn ChatGPT into your personal assistant for email, tasks & life admin.",
    bullets: [
      "Plug-and-play prompts for email, messages, and reports",
      "Daily planning and prioritization templates",
      "Meeting summary & note-tidying workflows",
      "Simple 7-day “get your time back” plan"
    ],
    price: "$19",
    format: "PDF guide + copy-paste prompts",
    checkoutUrl: "#" // TODO: replace with real checkout link
  },
  creative: {
    name: "AI Creative Studio",
    tagline: "Use AI to generate content, ideas, images and scripts on demand.",
    bullets: [
      "Prompts for social posts, blog ideas and hooks",
      "Story, script and caption generators",
      "Idea generators for products, offers, and branding",
      "Image & video prompt formulas for cinematic visuals"
    ],
    price: "$29",
    format: "Prompt packs + content templates",
    checkoutUrl: "#" // TODO: replace with real checkout link
  },
  learning: {
    name: "AI Learning Lab",
    tagline: "Turn AI into your personal tutor for exams, interviews, and new skills.",
    bullets: [
      "Study, revision and summarizing prompts for any topic",
      "Job interview practice scripts & follow-up prompts",
      "Language learning helpers and explanation templates",
      "7-day “level up a skill” challenge plan"
    ],
    price: "$39",
    format: "Guided playbook + practice prompts",
    checkoutUrl: "#" // TODO: replace with real checkout link
  },
  bundle: {
    name: "AI Everyday Mastery Bundle",
    tagline: "Get all three toolkits plus future updates for one low price.",
    bullets: [
      "Productivity, Creative Studio, and Learning Lab included",
      "Extras: bonus prompts, checklists and swipe files",
      "Lifetime access and all future updates",
      "Best value if you plan to use AI daily"
    ],
    price: "$59",
    format: "All guides, templates & bonuses",
    checkoutUrl: "#" // TODO: replace with real bundle checkout link
  }
};

// ===== Helper functions =====

function showElement(el) {
  el.classList.remove("hidden");
}

function hideElement(el) {
  el.classList.add("hidden");
}

function updateProgress() {
  const pct = (currentStep / totalSteps) * 100;
  progressFill.style.width = `${pct}%`;
  progressText.textContent = `Question ${currentStep} of ${totalSteps}`;
}

function setActiveStep(step) {
  currentStep = step;
  quizSteps.forEach((stepEl) => {
    const stepNum = Number(stepEl.dataset.step);
    if (stepNum === currentStep) {
      stepEl.classList.add("active");
    } else {
      stepEl.classList.remove("active");
    }
  });
  backBtn.disabled = currentStep === 1;
  updateProgress();
}

function resetQuizState() {
  quizState.category = null;
  quizState.experience = null;
  quizState.format = null;
  quizState.budget = null;
}

function renderPrimaryProduct(productKey) {
  const data = productData[productKey];
  if (!data) return;

  const nameEl = document.getElementById("primary-product-name");
  const taglineEl = document.getElementById("primary-product-tagline");
  const bulletsEl = document.getElementById("primary-product-bullets");
  const priceEl = document.getElementById("primary-product-price");
  const formatEl = document.getElementById("primary-product-format");

  nameEl.textContent = data.name;
  taglineEl.textContent = data.tagline;
  priceEl.textContent = data.price;
  formatEl.textContent = data.format;

  bulletsEl.innerHTML = "";
  data.bullets.forEach((b) => {
    const li = document.createElement("li");
    li.textContent = b;
    bulletsEl.appendChild(li);
  });

  primaryBuyBtn.dataset.checkoutUrl = data.checkoutUrl || "#";
}

function renderBundleProduct() {
  const data = productData.bundle;
  if (!data) return;

  bundlePriceEl.textContent = data.price;
  bundleFormatEl.textContent = data.format;
}

// Decide which product to show based ONLY on Q1 + Q4
function determineProduct(state) {
  const category = state.category || "productivity";
  const budget = state.budget || "mid";

  // If they choose bundle on last question → ALWAYS bundle
  if (budget === "bundle") {
    return "bundle";
  }

  // If they chose "a bit of everything" on Q1 → treat as bundle
  if (category === "bundle") {
    return "bundle";
  }

  // Otherwise, show exactly what they picked in Question 1
  if (category === "productivity") return "productivity";
  if (category === "creative") return "creative";
  if (category === "learning") return "learning";

  // Fallback
  return "productivity";
}

// Show result UI for a product key
function renderResult(productKey) {
  renderBundleProduct();

  if (productKey === "bundle") {
    // Show ONLY bundle card
    hideElement(singleCard);
    showElement(bundleCard);

    resultHeading.textContent = "Your Best Match: Full AI Bundle";
    resultIntro.textContent =
      "Based on your answers, you’ll see the biggest results by unlocking all three toolkits together.";
  } else {
    // Show ONLY single toolkit card
    showElement(singleCard);
    hideElement(bundleCard);

    renderPrimaryProduct(productKey);

    resultHeading.textContent = "Your Personalized AI Toolkit";
    resultIntro.textContent =
      "This toolkit is the best starting point based on your answers. You’ll see an option to upgrade to the full bundle after checkout.";
  }

  showElement(resultSection);
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ===== Event handlers =====

// Start quiz
startQuizBtn.addEventListener("click", () => {
  showElement(quizSection);
  hideElement(resultSection);
  resetQuizState();
  currentStep = 1;
  setActiveStep(1);

  quizSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});

// Handle answer clicks for each step
quizSteps.forEach((stepEl) => {
  stepEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".answer-btn");
    if (!btn) return;

    const value = btn.dataset.value;
    const stepNum = Number(stepEl.dataset.step);

    // Save the answer
    if (stepNum === 1) quizState.category = value;
    if (stepNum === 2) quizState.experience = value; // not used in logic
    if (stepNum === 3) quizState.format = value;     // not used in logic
    if (stepNum === 4) quizState.budget = value;

    if (stepNum < totalSteps) {
      setActiveStep(stepNum + 1);
    } else {
      // End of quiz → decide product and show result
      const productKey = determineProduct(quizState);
      renderResult(productKey);
    }
  });
});

// Back button
backBtn.addEventListener("click", () => {
  if (currentStep <= 1) return;
  const newStep = currentStep - 1;
  setActiveStep(newStep);
});

// Bundle strip at bottom → force bundle result
stripBundleBtn.addEventListener("click", () => {
  renderResult("bundle");
});

// ===== Upsell Modal & Checkout =====

function openUpsellModal() {
  upsellModal.classList.remove("hidden");
  upsellModal.setAttribute("aria-hidden", "false");
}

function closeUpsellModal() {
  upsellModal.classList.add("hidden");
  upsellModal.setAttribute("aria-hidden", "true");
}

modalCloseBtn.addEventListener("click", closeUpsellModal);

// If they say “keep single toolkit” in modal
modalKeepSingleBtn.addEventListener("click", () => {
  closeUpsellModal();
  const url = primaryBuyBtn.dataset.checkoutUrl || "#";
  if (url && url !== "#") {
    window.location.href = url;
  } else {
    alert(
      "Single toolkit checkout URL is not configured yet. Edit script.js to add your PayPal or checkout link."
    );
  }
});

// If they upgrade to bundle from modal
modalUpgradeBundleBtn.addEventListener("click", () => {
  closeUpsellModal();
  const url = productData.bundle.checkoutUrl || "#";
  if (url && url !== "#") {
    window.location.href = url;
  } else {
    alert(
      "Bundle checkout URL is not configured yet. Edit script.js to add your PayPal or checkout link."
    );
  }
});

// Primary product buy → show upsell modal first
primaryBuyBtn.addEventListener("click", () => {
  openUpsellModal();
});

// Direct bundle button → skip upsell
bundleBuyBtn.addEventListener("click", () => {
  const url = productData.bundle.checkoutUrl || "#";
  if (url && url !== "#") {
    window.location.href = url;
  } else {
    alert(
      "Bundle checkout URL is not configured yet. Edit script.js to add your PayPal or checkout link."
    );
  }
});

// Close modal by clicking backdrop
upsellModal.addEventListener("click", (e) => {
  if (e.target === upsellModal || e.target.classList.contains("modal-backdrop")) {
    closeUpsellModal();
  }
});

// Initialize bundle info
renderBundleProduct();
