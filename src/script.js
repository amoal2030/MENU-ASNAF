/**
 * @license
 * منيوم أصناف | Menu Asnaf
 * JavaScript Core Application & EmailJS Integration
 * Bilingual Language Switcher (Arabic / English)
 * GitHub Pages Compatible & Fully Responsive
 */

import emailjsBrowser from '@emailjs/browser';
import { TRANSLATIONS } from './translations.js';

// Language state
let currentLang = 'ar';

export function getTranslation(key) {
  return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS['ar']?.[key] || key;
}

// EmailJS Credentials provided in template configuration
const EMAILJS_CONFIG = {
  publicKey: 'w2fyjtJW5FOLcbSdG',
  serviceId: 'service_q6yotwf',
  templateId: 'template_m4j2ep9'
};

// Initialize EmailJS via bundled package or global fallback
const emailjsInstance = (typeof window !== 'undefined' && window.emailjs) ? window.emailjs : emailjsBrowser;

try {
  if (emailjsInstance && typeof emailjsInstance.init === 'function') {
    emailjsInstance.init({ publicKey: EMAILJS_CONFIG.publicKey });
  }
} catch (initErr) {
  console.warn('EmailJS initialization warning:', initErr);
}

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  setupLanguageSwitcher();
  setupHeaderScroll();
  setupMobileNav();
  setupSmoothScroll();
  setupFaqAccordion();
  setupMenuStudyForm();
  setupQuickConsultationForm();
});

// ==========================================================================
// 0. Language Switcher (Bilingual: عربي / EN)
// ==========================================================================
function setupLanguageSwitcher() {
  const savedLang = (() => {
    try {
      return localStorage.getItem('menu_asnaf_lang') || 'ar';
    } catch {
      return 'ar';
    }
  })();

  const buttons = document.querySelectorAll('.lang-btn, .mobile-lang-pill');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetLang = btn.getAttribute('data-lang');
      if (targetLang && targetLang !== currentLang) {
        applyLanguage(targetLang);
      }
    });
  });

  applyLanguage(savedLang);
}

export function applyLanguage(lang) {
  if (lang !== 'ar' && lang !== 'en') lang = 'ar';
  currentLang = lang;

  try {
    localStorage.setItem('menu_asnaf_lang', lang);
  } catch (err) {
    console.warn('Could not save language to localStorage:', err);
  }

  const dict = TRANSLATIONS[lang] || TRANSLATIONS['ar'];

  // 1. Update HTML document direction and language
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

  // 2. Update page title and meta description
  if (dict.page_title) {
    document.title = dict.page_title;
  }
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && dict.page_desc) {
    metaDesc.setAttribute('content', dict.page_desc);
  }

  // 3. Update all [data-i18n] text/HTML elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) {
      if (typeof dict[key] === 'string' && dict[key].includes('<') && dict[key].includes('>')) {
        el.innerHTML = dict[key];
      } else {
        el.textContent = dict[key];
      }
    }
  });

  // 4. Update all [data-i18n-placeholder] attributes
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) {
      el.setAttribute('placeholder', dict[key]);
    }
  });

  // 5. Update active toggle states
  document.querySelectorAll('.lang-btn, .mobile-lang-pill').forEach(btn => {
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // 6. Refresh live calculator if open
  if (window.__refreshPriceEstimate) {
    window.__refreshPriceEstimate();
  }
}

// ==========================================================================
// 1. Header Scroll Shadow
// ==========================================================================
function setupHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
}

// ==========================================================================
// 2. Mobile Navigation Toggle
// ==========================================================================
function setupMobileNav() {
  const toggleBtn = document.getElementById("mobile-menu-toggle");
  const drawer = document.getElementById("mobile-nav-drawer");
  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener("click", () => {
    drawer.classList.toggle("open");
    const isOpen = drawer.classList.contains("open");
    toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // Close drawer when clicking any standard link
  const links = drawer.querySelectorAll("a");
  links.forEach(link => {
    link.addEventListener("click", () => {
      drawer.classList.remove("open");
      toggleBtn.setAttribute("aria-expanded", "false");
    });
  });

  // Close when clicking outside or pressing Escape
  document.addEventListener("click", (e) => {
    if (drawer.classList.contains("open") && !drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
      drawer.classList.remove("open");
      toggleBtn.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("open")) {
      drawer.classList.remove("open");
      toggleBtn.setAttribute("aria-expanded", "false");
    }
  });
}

// ==========================================================================
// 3. Smooth Scrolling for In-Page Anchor Links
// ==========================================================================
function setupSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      const targetId = this.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: "smooth",
          block: targetId === "#quick-inquiry" ? "center" : "start"
        });

        // Highlight form and focus first field
        if (targetId === "#quick-inquiry" || targetEl.id === "quick-inquiry") {
          setTimeout(() => {
            const firstInput = document.getElementById("client-name");
            if (firstInput) {
              firstInput.focus();
            }
            targetEl.classList.remove("form-highlight-pulse");
            void targetEl.offsetWidth;
            targetEl.classList.add("form-highlight-pulse");
          }, 350);
        }
      }
    });
  });
}

// ==========================================================================
// 4. FAQ Accordion
// ==========================================================================
function setupFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(item => {
    const btn = item.querySelector(".faq-question-btn");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const isActive = item.classList.contains("active");
      faqItems.forEach(i => i.classList.remove("active"));
      if (!isActive) {
        item.classList.add("active");
      }
    });
  });
}

// ==========================================================================
// 5. Dedicated Menu Study Request Form (EmailJS Integration)
// ==========================================================================
function setupMenuStudyForm() {
  const form = document.getElementById("menu-study-form");
  const feedbackBox = document.getElementById("study-feedback-box");
  const submitBtn = document.getElementById("study-submit-btn");
  const btnText = document.getElementById("study-btn-text");

  if (!form || !submitBtn) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (feedbackBox) {
      feedbackBox.style.display = "none";
      feedbackBox.innerHTML = "";
    }

    const fromNameInput = document.getElementById("study-from-name");
    const restaurantNameInput = document.getElementById("study-restaurant-name");
    const activityTypeInput = document.getElementById("study-activity-type");
    const phoneNumberInput = document.getElementById("study-phone-number");
    const notesInput = document.getElementById("study-notes");

    const fromName = (fromNameInput?.value || "").trim();
    const restaurantName = (restaurantNameInput?.value || "").trim();
    const activityType = activityTypeInput?.value || (currentLang === 'en' ? "Fine Dining" : "مطعم فاخر");
    const phoneNumber = (phoneNumberInput?.value || "").trim();
    const notes = (notesInput?.value || "").trim();

    if (!fromName) {
      renderStudyFeedback("error", getTranslation("feedback_name_req"));
      fromNameInput?.focus();
      return;
    }

    if (!restaurantName) {
      renderStudyFeedback("error", getTranslation("feedback_rest_req"));
      restaurantNameInput?.focus();
      return;
    }

    if (!phoneNumber) {
      renderStudyFeedback("error", getTranslation("feedback_phone_req"));
      phoneNumberInput?.focus();
      return;
    }

    const phoneDigits = phoneNumber.replace(/[^0-9]/g, "");
    if (phoneDigits.length < 7) {
      renderStudyFeedback("error", getTranslation("feedback_phone_invalid"));
      phoneNumberInput?.focus();
      return;
    }

    const templateParams = {
      from_name: fromName,
      restaurant_name: restaurantName,
      activity_type: activityType,
      phone_number: phoneNumber,
      notes: notes || (currentLang === 'en' ? "No additional notes" : "لا توجد ملاحظات إضافية")
    };

    submitBtn.disabled = true;
    if (btnText) {
      btnText.textContent = currentLang === 'en' ? "Sending request..." : "جارٍ إرسال الطلب...";
    }

    try {
      const activeSender = (typeof window !== 'undefined' && window.emailjs) ? window.emailjs : emailjsBrowser;
      
      const response = await activeSender.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams,
        EMAILJS_CONFIG.publicKey
      );

      if (response && (response.status === 200 || response.text === "OK")) {
        form.reset();
        renderStudyFeedback("success", {
          fromName,
          restaurantName,
          activityType,
          phoneNumber
        });
      } else {
        throw new Error("Response status was not OK");
      }
    } catch (sendError) {
      console.error("EmailJS submission failure:", sendError);
      renderStudyFeedback("error", getTranslation("feedback_error_general"));
    } finally {
      submitBtn.disabled = false;
      if (btnText) {
        btnText.textContent = currentLang === 'en' ? "Submit Menu Study Request" : "إرسال طلب دراسة المنيو";
      }
    }
  });
}

function renderStudyFeedback(type, payload) {
  const feedbackBox = document.getElementById("study-feedback-box");
  if (!feedbackBox) return;

  feedbackBox.style.display = "block";

  if (type === "success") {
    const isEn = currentLang === 'en';
    const titleText = isEn 
      ? `Request received successfully, Mr./Ms. ${escapeHTML(payload.fromName)}!`
      : `تم استلام طلبك بنجاح، أستاذ ${escapeHTML(payload.fromName)}!`;
    const bodyText = isEn
      ? `Thank you for choosing <strong>Menu Asnaf</strong>. We will study the menu for <strong>${escapeHTML(payload.restaurantName)}</strong> (${escapeHTML(payload.activityType)}) and contact you via call or WhatsApp at <strong>${escapeHTML(payload.phoneNumber)}</strong> within 2 business hours.`
      : `شكرًا لاهتمامك بمنصة <strong>منيوم أصناف</strong>. سنقوم بدراسة قائمة <strong>${escapeHTML(payload.restaurantName)}</strong> (${escapeHTML(payload.activityType)}) بعناية، وسيتواصل معك مستشار الضيافة الرقمية عبر الاتصال أو الواتساب على الرقم <strong>${escapeHTML(payload.phoneNumber)}</strong> خلال ساعتي عمل لإرسال النموذج التجريبي الخاص بمنشأتكم.`;

    feedbackBox.innerHTML = `
      <div class="feedback-card feedback-success">
        <div class="feedback-icon-wrap" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <div class="feedback-content">
          <h4 class="feedback-title">${titleText}</h4>
          <p class="feedback-desc">${bodyText}</p>
        </div>
      </div>
    `;
  } else {
    const errorText = typeof payload === "string" ? payload : getTranslation("feedback_error_general");
    const isEn = currentLang === 'en';
    feedbackBox.innerHTML = `
      <div class="feedback-card feedback-error">
        <div class="feedback-icon-wrap" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div class="feedback-content">
          <h4 class="feedback-title">${isEn ? "Submission Alert" : "تنبيه بخصوص إرسال الطلب"}</h4>
          <p class="feedback-desc">
            ${escapeHTML(errorText)}
            <br>
            ${isEn ? 'You can also reach out immediately via ' : 'يمكنك أيضًا إرسال بيانات قائمتك مباشرة عبر '}
            <a href="https://wa.me/966541821068" target="_blank" rel="noopener noreferrer" style="text-decoration: underline; font-weight: 700; color: inherit;">
              ${isEn ? 'Direct WhatsApp Partner Support (+966 54 182 1068)' : 'واتساب خدمة الشركاء الفوري (+966 54 182 1068)'}
            </a>.
          </p>
        </div>
      </div>
    `;
  }

  feedbackBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ==========================================================================
// 6. General Consultation Form & Price Calculator
// ==========================================================================
function setupQuickConsultationForm() {
  const form = document.getElementById("consultation-form");
  const alertBox = document.getElementById("form-alert-success");
  const whatsappBtn = document.getElementById("whatsapp-direct-btn");
  const submitBtn = document.getElementById("consultation-submit-btn");
  const btnText = document.getElementById("consultation-btn-text");

  // Platform & Calculation Elements
  const platformRadios = document.querySelectorAll('input[name="menu-platform"]');
  const pagesContainer = document.getElementById("pages-count-container");
  const pagesInput = document.getElementById("pages-count");
  const btnPageDec = document.getElementById("btn-page-dec");
  const btnPageInc = document.getElementById("btn-page-inc");
  const presetPills = document.querySelectorAll("#pages-preset-pills .page-pill");
  const featuresContainer = document.getElementById("features-selection-container");
  const featureCheckboxes = document.querySelectorAll('input[name="extra-feature"]');

  const estimateBox = document.getElementById("price-estimate-box");
  const breakdownPagesText = document.getElementById("breakdown-pages-text");
  const breakdownPagesCost = document.getElementById("breakdown-pages-cost");
  const breakdownFeaturesRow = document.getElementById("breakdown-features-row");
  const breakdownFeaturesText = document.getElementById("breakdown-features-text");
  const breakdownFeaturesCost = document.getElementById("breakdown-features-cost");
  const breakdownChips = document.getElementById("breakdown-selected-chips");
  const estimateUsd = document.getElementById("estimate-usd");
  const estimateSar = document.getElementById("estimate-sar");

  const labelPlatformWeb = document.getElementById("label-platform-web");
  const labelPlatformApp = document.getElementById("label-platform-app");

  const PHONE_NUMBER = "+966 54 182 1068";
  const PHONE_RAW = "966541821068";
  const EMAIL_ADDRESS = "amoal2030@gmail.com";
  const SAR_PER_USD = 3.75;
  const RATE_PER_PAGE_USD = 1.0;

  // Real-time Calculation Helper
  function updatePriceEstimate() {
    const pagesCount = Math.max(1, parseInt(pagesInput?.value || "1", 10) || 1);
    const pagesCost = pagesCount * RATE_PER_PAGE_USD;

    // Calculate selected features
    const selectedFeatures = [];
    let featuresCost = 0;

    featureCheckboxes.forEach(cb => {
      const card = cb.closest(".feature-checkbox-card");
      if (cb.checked) {
        if (card) card.classList.add("selected");
        const price = parseFloat(cb.getAttribute("data-price") || "0");
        const titleAr = cb.getAttribute("data-title-ar") || "";
        const titleEn = cb.getAttribute("data-title-en") || "";
        const title = currentLang === 'en' ? (titleEn || titleAr) : (titleAr || titleEn);
        featuresCost += price;
        selectedFeatures.push({ value: cb.value, title, price });
      } else {
        if (card) card.classList.remove("selected");
      }
    });

    const totalUsd = pagesCost + featuresCost;
    const totalSar = totalUsd * SAR_PER_USD;

    // Update breakdown: Pages
    if (breakdownPagesText) {
      if (currentLang === 'en') {
        breakdownPagesText.textContent = `${pagesCount} ${pagesCount === 1 ? 'Page' : 'Pages'} ($1 / page)`;
      } else {
        const unit = pagesCount === 1 ? 'صفحة' : (pagesCount <= 10 ? 'صفحات' : 'صفحة');
        breakdownPagesText.textContent = `${pagesCount} ${unit} (1$ / صفحة)`;
      }
    }
    if (breakdownPagesCost) {
      breakdownPagesCost.textContent = `$${pagesCost.toFixed(2)}`;
    }

    // Update breakdown: Features
    if (breakdownFeaturesRow) {
      if (selectedFeatures.length > 0) {
        breakdownFeaturesRow.style.display = "flex";
        if (breakdownFeaturesText) {
          breakdownFeaturesText.textContent = currentLang === 'en'
            ? `Selected Add-ons (${selectedFeatures.length})`
            : `المزايا الإضافية المختارة (${selectedFeatures.length})`;
        }
        if (breakdownFeaturesCost) {
          breakdownFeaturesCost.textContent = `+$${featuresCost.toFixed(2)}`;
        }
      } else {
        breakdownFeaturesRow.style.display = "none";
      }
    }

    // Render chips
    if (breakdownChips) {
      if (selectedFeatures.length > 0) {
        breakdownChips.innerHTML = selectedFeatures.map(f => `
          <span class="breakdown-chip">
            <span>✓ ${escapeHTML(f.title)}</span>
            <strong style="color: var(--gold-primary);">+$${f.price}</strong>
          </span>
        `).join("");
      } else {
        breakdownChips.innerHTML = "";
      }
    }

    // Total Amount Cards
    if (estimateUsd) estimateUsd.textContent = totalUsd.toFixed(2);
    if (estimateSar) estimateSar.textContent = totalSar.toFixed(2);

    if (estimateBox) {
      estimateBox.style.display = "block";
    }

    return { pagesCount, pagesCost, selectedFeatures, featuresCost, totalUsd, totalSar };
  }

  // Sync preset pills active state
  function syncPresets(count) {
    presetPills.forEach(pill => {
      const p = parseInt(pill.getAttribute("data-pages") || "0", 10);
      if (p === count) {
        pill.classList.add("active");
      } else {
        pill.classList.remove("active");
      }
    });
  }

  // Stepper buttons listeners
  if (btnPageDec) {
    btnPageDec.addEventListener("click", () => {
      let currentVal = parseInt(pagesInput?.value || "1", 10) || 1;
      if (currentVal > 1) {
        currentVal -= 1;
        if (pagesInput) pagesInput.value = currentVal;
        syncPresets(currentVal);
        updatePriceEstimate();
      }
    });
  }

  if (btnPageInc) {
    btnPageInc.addEventListener("click", () => {
      let currentVal = parseInt(pagesInput?.value || "1", 10) || 1;
      currentVal += 1;
      if (pagesInput) pagesInput.value = currentVal;
      syncPresets(currentVal);
      updatePriceEstimate();
    });
  }

  // Preset pills listeners
  presetPills.forEach(pill => {
    pill.addEventListener("click", (e) => {
      e.preventDefault();
      const p = parseInt(pill.getAttribute("data-pages") || "5", 10);
      if (pagesInput) pagesInput.value = p;
      syncPresets(p);
      updatePriceEstimate();
    });
  });

  // Pages input direct typing listeners
  if (pagesInput) {
    pagesInput.addEventListener("input", () => {
      const val = parseInt(pagesInput.value || "1", 10) || 1;
      syncPresets(val);
      updatePriceEstimate();
    });
    pagesInput.addEventListener("change", () => {
      const val = Math.max(1, parseInt(pagesInput.value || "1", 10) || 1);
      pagesInput.value = val;
      syncPresets(val);
      updatePriceEstimate();
    });
  }

  // Feature checkboxes listeners
  featureCheckboxes.forEach(cb => {
    cb.addEventListener("change", updatePriceEstimate);
  });

  // Platform Selector Event Listeners
  if (platformRadios) {
    platformRadios.forEach(radio => {
      radio.addEventListener("change", (e) => {
        const val = e.target.value;
        if (val === "موقع") {
          if (labelPlatformWeb) labelPlatformWeb.classList.add("active");
          if (labelPlatformApp) labelPlatformApp.classList.remove("active");
        } else {
          if (labelPlatformApp) labelPlatformApp.classList.add("active");
          if (labelPlatformWeb) labelPlatformWeb.classList.remove("active");
        }
        updatePriceEstimate();
      });
    });
  }

  // Expose helper globally for language switch updates
  window.__refreshPriceEstimate = updatePriceEstimate;

  // Initial calculation on load
  updatePriceEstimate();

  // Direct WhatsApp Button Default Link
  if (whatsappBtn) {
    const defaultMsg = currentLang === 'en'
      ? "Hello, I would like to inquire about launching a professional digital menu for my venue via «Menu Asnaf»."
      : "مرحباً، أود الاستفسار عن إطلاق منيو رقمي احترافي لمنشأتي عبر «منيوم أصناف».";
    whatsappBtn.href = `https://wa.me/${PHONE_RAW}?text=${encodeURIComponent(defaultMsg)}`;
    whatsappBtn.target = "_blank";
    whatsappBtn.rel = "noopener noreferrer";
  }

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = (document.getElementById("client-name")?.value || "").trim();
    const brand = (document.getElementById("client-brand")?.value || "").trim();
    const phone = (document.getElementById("client-phone")?.value || "").trim();
    const type = (document.getElementById("client-type")?.value || "").trim();
    const platform = document.querySelector('input[name="menu-platform"]:checked')?.value || "موقع";
    const notes = (document.getElementById("client-notes")?.value || "").trim();

    if (!name || !phone || !brand || !type) {
      if (alertBox) {
        alertBox.style.display = "block";
        alertBox.className = "feedback-card feedback-error";
        alertBox.innerHTML = `
          <div class="feedback-icon-wrap" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div class="feedback-content">
            <h4 class="feedback-title" style="margin: 0; font-size: 0.95rem;">${escapeHTML(getTranslation("feedback_fill_required"))}</h4>
          </div>
        `;
        alertBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      return;
    }

    const calc = updatePriceEstimate();
    const isEn = currentLang === 'en';

    // Format features list text
    const featuresListSummary = calc.selectedFeatures.length > 0
      ? calc.selectedFeatures.map(f => `${f.title} (+$${f.price})`).join("، ")
      : (isEn ? "No additional features" : "بدون مزايا إضافية");

    const priceDetailsText = ` | Pages: ${calc.pagesCount} ($${calc.pagesCost.toFixed(2)}) | Add-ons: ${calc.selectedFeatures.length} ($${calc.featuresCost.toFixed(2)}) | Total: $${calc.totalUsd.toFixed(2)} (~ ${calc.totalSar.toFixed(2)} SAR)`;

    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.textContent = getTranslation("btn_submitting");

    // Attempt background email notification via EmailJS if available
    try {
      const activeSender = (typeof window !== 'undefined' && window.emailjs) ? window.emailjs : emailjsBrowser;
      if (activeSender && typeof activeSender.send === 'function') {
        const fullNotes = `[Inquiry - ${platform}]${priceDetailsText}\nFeatures: ${featuresListSummary}${notes ? `\nNotes: ${notes}` : ""}`;
        await activeSender.send(
          EMAILJS_CONFIG.serviceId,
          EMAILJS_CONFIG.templateId,
          {
            from_name: name,
            restaurant_name: brand,
            activity_type: `${type} (${platform})`,
            phone_number: phone,
            notes: fullNotes
          },
          EMAILJS_CONFIG.publicKey
        );
      }
    } catch (err) {
      console.warn("EmailJS notification error:", err);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.textContent = getTranslation("btn_submit_inquiry");
    }

    // Build polite WhatsApp message in current language
    let whatsappLines;
    if (isEn) {
      whatsappLines = [
        `Hello, I would like to start my digital menu with «Menu Asnaf»:`,
        `• Name: ${name}`,
        `• Venue: ${brand}`,
        `• Business Type: ${type}`,
        `• Required Menu: ${platform === "موقع" ? "Web Menu (Website)" : "Custom Mobile App"}`,
        `• Menu Pages: ${calc.pagesCount} pages ($${calc.pagesCost.toFixed(2)})`
      ];
      if (calc.selectedFeatures.length > 0) {
        whatsappLines.push(`• Selected Add-ons (${calc.selectedFeatures.length}):`);
        calc.selectedFeatures.forEach(f => {
          whatsappLines.push(`  ✓ ${f.title} (+$${f.price})`);
        });
      }
      whatsappLines.push(`• Total Estimated Cost: $${calc.totalUsd.toFixed(2)} (${calc.totalSar.toFixed(2)} SAR)`);
      if (notes) {
        whatsappLines.push(`• Additional Notes: ${notes}`);
      }
    } else {
      whatsappLines = [
        `مرحباً، أود بدء مشروعي مع «منيوم أصناف»:`,
        `• الاسم: ${name}`,
        `• المنشأة: ${brand}`,
        `• نوع النشاط: ${type}`,
        `• نوع المنيو المطلوب: ${platform === "موقع" ? "موقع إلكتروني (Web Menu)" : "تطبيق مخصص (Mobile App)"}`,
        `• عدد الصفحات: ${calc.pagesCount} صفحات ($${calc.pagesCost.toFixed(2)})`
      ];
      if (calc.selectedFeatures.length > 0) {
        whatsappLines.push(`• المزايا الإضافية المختارة (${calc.selectedFeatures.length}):`);
        calc.selectedFeatures.forEach(f => {
          whatsappLines.push(`  ✓ ${f.title} (+$${f.price})`);
        });
      }
      whatsappLines.push(`• التكلفة الإجمالية التقديرية: $${calc.totalUsd.toFixed(2)} (~ ${calc.totalSar.toFixed(2)} ر.س)`);
      if (notes) {
        whatsappLines.push(`• ملاحظات إضافية: ${notes}`);
      }
    }

    const whatsappText = encodeURIComponent(whatsappLines.join("\n"));
    const whatsappUrl = `https://wa.me/${PHONE_RAW}?text=${whatsappText}`;

    if (alertBox) {
      alertBox.style.display = "block";
      alertBox.className = "feedback-card feedback-success";
      alertBox.innerHTML = `
        <div class="feedback-icon-wrap" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <div class="feedback-content" style="width: 100%;">
          <h4 class="feedback-title">${isEn ? `Request received successfully, Mr./Ms. ${escapeHTML(name)}!` : `تم استلام طلبك بنجاح، أستاذ ${escapeHTML(name)}!`}</h4>
          <p class="feedback-desc" style="margin-bottom: 0.5rem;">
            ${isEn ? `Your request for (<strong>${escapeHTML(brand)}</strong> - Type: ${escapeHTML(type)} | Menu: ${escapeHTML(platform)}) is being reviewed immediately.` : `طلبك الخاص بـ (<strong>${escapeHTML(brand)}</strong> - نشاط: ${escapeHTML(type)} | منيو: ${escapeHTML(platform)}) قيد المتابعة الفورية.`}
          </p>

          <div style="background: rgba(194, 155, 74, 0.12); border: 1px solid var(--gold-border); border-radius: 8px; padding: 0.75rem 0.95rem; font-size: 0.88rem; margin-bottom: 0.75rem; color: var(--brand-forest);">
            <div style="font-weight: 700; margin-bottom: 0.35rem;">
              📄 ${isEn ? `Menu Pages: <strong>${calc.pagesCount}</strong> ($${calc.pagesCost.toFixed(2)})` : `عدد الصفحات: <strong>${calc.pagesCount}</strong> صفحات ($${calc.pagesCost.toFixed(2)})`}
            </div>
            ${calc.selectedFeatures.length > 0 ? `
              <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.35rem;">
                ✨ ${isEn ? `Add-ons: ${escapeHTML(featuresListSummary)}` : `المزايا المختارة: ${escapeHTML(featuresListSummary)}`}
              </div>
            ` : ''}
            <div style="font-size: 0.95rem; font-weight: 800; border-top: 1px dashed var(--gold-border); padding-top: 0.35rem; margin-top: 0.35rem;">
              💰 ${isEn ? 'Total Estimated Cost:' : 'التكلفة الإجمالية التقديرية:'} <span style="color: var(--gold-primary);">$${calc.totalUsd.toFixed(2)}</span> (~ ${calc.totalSar.toFixed(2)} ${isEn ? 'SAR' : 'ر.س'})
            </div>
          </div>

          <p class="feedback-desc" style="margin-bottom: 0.75rem;">
            ${isEn ? `Our digital hospitality consultant will reach out shortly on <strong>${escapeHTML(phone)}</strong> or via <strong>${EMAIL_ADDRESS}</strong>.` : `سيتواصل معك مستشار الضيافة الرقمية فوراً على الرقم <strong>${escapeHTML(phone)}</strong> أو عبر البريد <strong>${EMAIL_ADDRESS}</strong>.`}
          </p>
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 0.6rem;">
            <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm" style="background-color: #25D366; color: #FFFFFF; font-weight: 700; border-radius: 9999px; display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.1rem; text-decoration: none;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              <span>${isEn ? `Follow up on WhatsApp (${PHONE_NUMBER}) ↗` : `متابعة تفاصيل الاستفسار عبر واتساب (${PHONE_NUMBER}) ↗`}</span>
            </a>
          </div>
        </div>
      `;
      alertBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    form.reset();
    if (pagesInput) pagesInput.value = "5";
    syncPresets(5);
    updatePriceEstimate();
    if (labelPlatformWeb) labelPlatformWeb.classList.add("active");
    if (labelPlatformApp) labelPlatformApp.classList.remove("active");
  });
}

// Safe HTML character escaping to prevent XSS injection
function escapeHTML(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}
