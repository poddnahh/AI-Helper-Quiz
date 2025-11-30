// ===== Quiz Logic & Product Recommendation =====

// Track scores for each category
const scores = {
  productivity: 0,
  creative: 0,
  learning: 0,
  bundle: 0
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

// Product data (replace checkoutUrl with real PayPal / Gumroad links)
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

// ===== Helpers =====

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

function resetScores() {
  scores.productivity = 0;
  scores.creative = 0;
  scores.learning = 0;
  scores.bundle = 0;
}

// Store answers so going back still works
const answersByStep = {}; // step -> [tags]

function recordAnswer(step, tags) {
  answersByStep[step] = tags;
}

function recomputeScores() {
  resetScores();
  Object.keys(answersByStep).forEach((stepKey) => {
    const tags = answersByStep[stepKey];
    tags.forEach((tag) => {
      if (scores[tag] !== undefined) {
        scores[tag]++;
      }
    });
  });
}

function getPrimaryCategory() {
  const entries = Object.entries(scores);
  entries.sort((a, b) => b[1] - a[1]); // highest score first
  const [topCategory, topScore] = entries[0];

  if (topScore === 0) return "bundle"; // default safety

  return topCategory;
}

// Fill DOM with primary product data (single toolkit)
function renderPrimaryProduct(category) {
  const primaryData =
    productData[category] || productData["productivity"];

  const nameEl = document.getElementById("primary-product-name");
  const taglineEl = document.getElementById("primary-product-tagline");
  const bulletsEl = document.getElementById("primary-product-bullets");
  const priceEl = document.getElementById("primary-product-price");
  const formatEl = document.getElementById("primary-product-format");

  nameEl.textContent = primaryData.name;
  taglineEl.textContent = primaryData.tagline;
  priceEl.textContent = primaryData.price;
  formatEl.textContent = primaryData.format;

  bulletsEl.innerHTML = "";
  primaryData.bullets.forEach((b) => {
    const li = document.createElement("li");
    li.textContent = b;
    bulletsEl.appendChild(li);
  });

  // Store checkout URL for this product on the button
  primaryBuyBtn.dataset.checkoutUrl = primaryData.checkoutUrl || "#";
}

// Fill bundle price/format from data
function renderBundleProduct() {
  const bundleData = productData.bundle;
  if (!bundleData) return;

  bundlePriceEl.textContent = bundleData.price;
  bundleFormatEl.textContent = bundleData.format;
}

// ===== Event Handlers =====

// Start quiz
startQuizBtn.addEventListener("click", () => {
  showElement(quizSection);
  hideElement(resultSection);
  resetScores();
  Object.keys(answersByStep).forEach((k) => delete answersByStep[k]);
  currentStep = 1;
  setActiveStep(1);

  document.getElementById("quiz-section").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});

// Answer clicks (delegated per step)
quizSteps.forEach((stepEl) => {
  stepEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".answer-btn");
    if (!btn) return;

    const tags = (btn.dataset.tags || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const stepNum = Number(stepEl.dataset.step);

    // Record and recompute scores
    recordAnswer(stepNum, tags);
    recomputeScores();

    if (stepNum < totalSteps) {
      setActiveStep(stepNum + 1);
    } else {
      // ===== End of quiz -> show result =====

      // Default: pick top scoring category
      let primaryCategory = getPrimaryCategory();

      // OVERRIDE: if user picked bundle on the last question,
      // force bundle as the recommendation.
      if (tags.includes("bundle")) {
        primaryCategory = "bundle";
      }

      const isBundle = primaryCategory === "bundle";

      renderBundleProduct();

      if (isBundle) {
        // Bundle-only result
        singleCard.classList.add("hidden");
        bundleCard.classList.remove("hidden");

        resultHeading.textContent = "Your Best Match: Full AI Bundle";
        resultIntro.textContent =
          "Based on your answers, you’ll get the biggest results by unlocking all three toolkits together.";
      } else {
        // Single toolkit + bundle upsell
        singleCard.classList.remove("hidden");
        bundleCard.classList.remove("hidden");

        resultHeading.textContent = "Your Personalized AI Recommendation";
        resultIntro.textContent =
          "Based on your answers, here’s where you’ll see the biggest results in the next 7 days:";

        renderPrimaryProduct(primaryCategory);
      }

      showElement(resultSection);
      resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
});

// Back button
backBtn.addEventListener("click", () => {
  if (currentStep <= 1) return;
  const newStep = currentStep - 1;
  setActiveStep(newStep);
});

// Bundle strip button scrolls to result/bundle
stripBundleBtn.addEventListener("click", () => {
  renderBundleProduct();
  showElement(resultSection);
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
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

// Primary product buy → always show upsell modal first
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

// Initial bundle price text
renderBundleProduct();
