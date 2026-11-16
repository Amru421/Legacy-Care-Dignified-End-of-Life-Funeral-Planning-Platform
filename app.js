const STORAGE_KEY = "legacycare-demo-v1";

const providers = [
  { id: "shanti", name: "Shanti Farewell Care", category: "ceremony", categoryLabel: "Ceremony & funeral care", symbol: "✳", price: "From ₹18,000", location: "Mumbai", description: "Gentle, thoughtful support with ceremony planning and farewell arrangements." },
  { id: "sukoon", name: "Sukoon Memorial Services", category: "ceremony", categoryLabel: "Ceremony & funeral care", symbol: "♡", price: "From ₹22,000", location: "Pune", description: "A caring team to help families navigate the details, at their own pace." },
  { id: "safar", name: "Safar Care Transport", category: "transport", categoryLabel: "Thoughtful transportation", symbol: "↗", price: "From ₹4,500", location: "Mumbai", description: "Respectful, dependable transportation for loved ones and family members." },
  { id: "phool", name: "Phool & Petal Studio", category: "flowers", categoryLabel: "Flowers & ceremony details", symbol: "✿", price: "From ₹2,500", location: "Mumbai", description: "Seasonal flowers and simple, personal touches for a meaningful gathering." },
  { id: "prarthana", name: "Prarthana Ritual Care", category: "ceremony", categoryLabel: "Ritual & ceremony support", symbol: "☼", price: "From ₹7,000", location: "Thane", description: "Patient guidance in arranging a ceremony that honours your traditions." },
  { id: "saath", name: "Saath Family Support", category: "transport", categoryLabel: "Family & travel support", symbol: "⌂", price: "From ₹3,000", location: "Pune", description: "Practical travel and coordination support for family members coming together." },
];

const defaultState = {
  name: "Meera Shah",
  ritual: "",
  location: "",
  ceremony: "",
  budget: "",
  nominee: "Anaya Shah",
  relation: "Daughter",
  email: "",
  phone: "",
  selectedProviders: [],
  note: "",
  documents: [],
};

let state = loadState();
let toastTimer;
let modalReturnFocus;

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { ...defaultState, selectedProviders: [], documents: [] };
    const parsed = JSON.parse(saved);
    return {
      ...defaultState,
      ...parsed,
      selectedProviders: Array.isArray(parsed.selectedProviders) ? parsed.selectedProviders : [],
      documents: Array.isArray(parsed.documents) ? parsed.documents : [],
    };
  } catch (error) {
    console.error("Could not read the saved LegacyCare demo data.", error);
    return { ...defaultState, selectedProviders: [], documents: [] };
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    const status = document.getElementById("save-status");
    status.textContent = "All changes saved";
    status.parentElement.classList.remove("saving");
  } catch (error) {
    console.error("Could not save LegacyCare demo data.", error);
    const status = document.getElementById("save-status");
    status.textContent = "Could not save";
    status.parentElement.classList.add("saving");
    showToast("Your browser could not save this change. Check available storage and try again.");
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3300);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function getProgress() {
  const preferencesComplete = Boolean(state.ritual || state.location || state.ceremony);
  const personComplete = Boolean(state.nominee);
  const providerComplete = state.selectedProviders.length > 0;
  const completed = [preferencesComplete, personComplete, providerComplete].filter(Boolean).length;
  const detailBonus = [state.ritual, state.location, state.ceremony].filter(Boolean).length;
  return Math.min(100, Math.round((completed / 3) * 55 + (detailBonus / 3) * 45));
}

function renderProgress() {
  const percentage = getProgress();
  document.getElementById("progress-value").textContent = `${percentage}%`;
  document.getElementById("progress-bar").style.width = `${percentage}%`;
  document.getElementById("plan-progress").textContent = `${percentage}%`;
  document.getElementById("plan-progress-bar").style.width = `${percentage}%`;
  document.getElementById("plan-progress-hint").textContent = percentage === 100
    ? "Your wishes are in a thoughtful place. You can update them anytime."
    : "A lovely start. Add a few more details whenever you’re ready.";
  setChecklist("ritual", Boolean(state.ritual || state.location || state.ceremony));
  setChecklist("family", Boolean(state.nominee));
  setChecklist("provider", state.selectedProviders.length > 0);
  document.getElementById("plan-nav-badge").textContent = String(
    [Boolean(state.ritual || state.location || state.ceremony), Boolean(state.nominee), state.selectedProviders.length > 0].filter((value) => !value).length,
  );
}

function setChecklist(name, complete) {
  const row = document.getElementById(`check-${name}`).parentElement;
  document.getElementById(`check-${name}`).textContent = complete ? "✓" : "○";
  document.getElementById(`check-${name}-state`).textContent = complete ? "In place" : "To do";
  row.classList.toggle("completed", complete);
}

function renderProfile() {
  const firstName = state.name.trim().split(/\s+/)[0] || "there";
  document.getElementById("welcome-name").textContent = firstName;
  document.getElementById("sidebar-name").textContent = state.name;
  document.getElementById("sidebar-avatar").textContent = firstName.charAt(0).toUpperCase();
  document.getElementById("top-avatar").textContent = firstName.charAt(0).toUpperCase();
  document.getElementById("nominee-name").textContent = state.nominee || "Add someone you trust";
  document.getElementById("nominee-relation").textContent = state.nominee ? `${state.relation || "Trusted person"} · Nominee` : "Your trusted person";
  document.getElementById("nominee-avatar").textContent = (state.nominee || "?").trim().charAt(0).toUpperCase();
  document.getElementById("family-name").textContent = state.nominee || "No nominee added";
  document.getElementById("family-relation").textContent = state.relation || "Trusted person";
  document.getElementById("family-avatar").textContent = (state.nominee || "?").trim().charAt(0).toUpperCase();
  document.getElementById("family-email").textContent = state.email || "Not added yet";
  document.getElementById("family-phone").textContent = state.phone || "Not added yet";
}

function populatePlanForm() {
  document.getElementById("planner-name").value = state.name;
  document.getElementById("ritual-type").value = state.ritual;
  document.getElementById("location").value = state.location;
  document.getElementById("ceremony").value = state.ceremony;
  document.getElementById("budget").value = state.budget;
}

function providerCard(provider, compact = false) {
  const selected = state.selectedProviders.includes(provider.id);
  const styleClass = provider.category === "transport" ? "transport" : provider.category === "flowers" ? "flowers" : "";
  if (compact) {
    return `<article class="featured-provider"><span class="provider-icon ${styleClass}">${provider.symbol}</span><div class="provider-info"><strong>${escapeHtml(provider.name)}</strong><span>${escapeHtml(provider.categoryLabel)} · ${escapeHtml(provider.location)}</span></div><span class="provider-price">${escapeHtml(provider.price)}</span></article>`;
  }
  return `<article class="provider-card">
    <div class="provider-card-top"><span class="provider-icon ${styleClass}">${provider.symbol}</span><span class="verified-tag">✓ Example listing</span></div>
    <h3>${escapeHtml(provider.name)}</h3><p class="provider-category">${escapeHtml(provider.categoryLabel)} · ${escapeHtml(provider.location)}</p>
    <p class="provider-description">${escapeHtml(provider.description)}</p>
    <div class="provider-meta"><span>Indicative pricing</span><strong>${escapeHtml(provider.price)}</strong></div>
    <button class="button ${selected ? "button-added" : "button-secondary"}" data-provider="${provider.id}">${selected ? "✓ Added to my wishes" : "Add to my wishes"}</button>
  </article>`;
}

function renderProviders() {
  const search = document.getElementById("provider-search").value.trim().toLowerCase();
  const category = document.getElementById("provider-filter").value;
  const results = providers.filter((provider) => {
    const matchesCategory = category === "all" || provider.category === category;
    const searchText = `${provider.name} ${provider.categoryLabel} ${provider.location} ${provider.description}`.toLowerCase();
    return matchesCategory && searchText.includes(search);
  });
  document.getElementById("provider-grid").innerHTML = results.length
    ? results.map((provider) => providerCard(provider)).join("")
    : '<div class="empty-state">No providers match that search. Try another name, place, or service.</div>';
  document.getElementById("featured-providers").innerHTML = providers.slice(0, 2).map((provider) => providerCard(provider, true)).join("");
}

function renderDocuments() {
  const list = document.getElementById("document-list");
  if (state.documents.length === 0) {
    list.innerHTML = '<li class="empty-documents">Your list is empty for now. Add a reminder above.</li>';
    return;
  }
  list.innerHTML = state.documents.map((name, index) => `<li><span>▤</span><span>${escapeHtml(name)}</span><button type="button" data-remove-document="${index}" aria-label="Remove ${escapeHtml(name)}">×</button></li>`).join("");
}

function renderAll() {
  renderProfile();
  populatePlanForm();
  renderProgress();
  renderProviders();
  renderDocuments();
  document.getElementById("personal-note").value = state.note;
}

function navigate(viewName) {
  const view = document.getElementById(`view-${viewName}`);
  if (!view) return;
  document.querySelectorAll(".view").forEach((item) => item.classList.toggle("active", item === view));
  document.querySelectorAll(".nav-link").forEach((item) => item.classList.toggle("active", item.dataset.view === viewName));
  const activeLink = document.querySelector(`.nav-link[data-view="${viewName}"]`);
  document.getElementById("page-crumb").textContent = activeLink ? activeLink.textContent.trim() : "Overview";
  document.getElementById("sidebar").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openFamilyModal(event) {
  modalReturnFocus = event.currentTarget instanceof HTMLElement ? event.currentTarget : document.activeElement;
  document.getElementById("nominee-input").value = state.nominee;
  document.getElementById("relation-input").value = state.relation;
  document.getElementById("email-input").value = state.email;
  document.getElementById("phone-input").value = state.phone;
  const modal = document.getElementById("profile-modal");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.getElementById("nominee-input").focus();
}

function closeFamilyModal() {
  const modal = document.getElementById("profile-modal");
  if (!modal.classList.contains("open")) return;
  modal.classList.remove("open");
  if (modalReturnFocus instanceof HTMLElement && modalReturnFocus.isConnected) {
    modalReturnFocus.focus();
  }
  modal.setAttribute("aria-hidden", "true");
}

document.querySelectorAll("[data-view]").forEach((element) => {
  element.addEventListener("click", (event) => {
    event.preventDefault();
    navigate(element.dataset.view);
  });
});

document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => navigate(button.dataset.go));
});

document.getElementById("mobile-menu").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

document.getElementById("plan-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  state.name = String(formData.get("name") || "").trim() || defaultState.name;
  state.ritual = String(formData.get("ritual") || "");
  state.location = String(formData.get("location") || "").trim();
  state.ceremony = String(formData.get("ceremony") || "").trim();
  state.budget = String(formData.get("budget") || "");
  persist();
  renderAll();
  showToast("Your wishes have been saved in this browser.");
});

document.getElementById("family-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  state.nominee = String(formData.get("nominee") || "").trim();
  state.relation = String(formData.get("relation") || "").trim();
  state.email = String(formData.get("email") || "").trim();
  state.phone = String(formData.get("phone") || "").trim();
  persist();
  renderAll();
  closeFamilyModal();
  showToast("Your trusted person has been updated.");
});

document.getElementById("edit-family").addEventListener("click", openFamilyModal);
document.getElementById("profile-button").addEventListener("click", openFamilyModal);
document.getElementById("top-avatar").addEventListener("click", openFamilyModal);
document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", closeFamilyModal));
document.getElementById("profile-modal").addEventListener("click", (event) => {
  if (event.target.id === "profile-modal") closeFamilyModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeFamilyModal();
});

document.getElementById("provider-search").addEventListener("input", renderProviders);
document.getElementById("provider-filter").addEventListener("change", renderProviders);
document.getElementById("provider-grid").addEventListener("click", (event) => {
  const button = event.target.closest("[data-provider]");
  if (!button) return;
  const providerId = button.dataset.provider;
  if (state.selectedProviders.includes(providerId)) {
    state.selectedProviders = state.selectedProviders.filter((id) => id !== providerId);
  } else {
    state.selectedProviders.push(providerId);
  }
  persist();
  renderAll();
  showToast(state.selectedProviders.includes(providerId) ? "Added to your wishes." : "Removed from your wishes.");
});

document.getElementById("save-note").addEventListener("click", () => {
  state.note = document.getElementById("personal-note").value.trim();
  persist();
  showToast("Your private note has been saved in this browser.");
});

document.getElementById("document-upload").addEventListener("change", (event) => {
  const names = Array.from(event.target.files, (file) => file.name);
  state.documents = [...state.documents, ...names];
  persist();
  renderDocuments();
  event.target.value = "";
  if (names.length) showToast("Document names added. The files themselves were not uploaded.");
});

document.getElementById("document-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-document]");
  if (!button) return;
  state.documents.splice(Number(button.dataset.removeDocument), 1);
  persist();
  renderDocuments();
});

document.getElementById("download-plan").addEventListener("click", () => {
  const selectedNames = providers.filter((provider) => state.selectedProviders.includes(provider.id)).map((provider) => `- ${provider.name} (${provider.categoryLabel}, ${provider.price})`);
  const contents = [
    "LEGACYCARE — MY WISHES",
    "A personal guide prepared with care",
    "",
    `Name: ${state.name || "Not provided"}`,
    `Farewell preference: ${state.ritual || "Not provided"}`,
    `Preferred location: ${state.location || "Not provided"}`,
    `Ceremony wishes: ${state.ceremony || "Not provided"}`,
    `Budget to keep in mind: ${state.budget ? `₹${state.budget}` : "Not provided"}`,
    "",
    `Trusted person: ${state.nominee || "Not provided"}${state.relation ? ` (${state.relation})` : ""}`,
    `Contact email: ${state.email || "Not provided"}`,
    `Contact phone: ${state.phone || "Not provided"}`,
    "",
    "Selected services:",
    ...(selectedNames.length ? selectedNames : ["- None selected"]),
    "",
    "A note for loved ones:",
    state.note || "No note saved.",
    "",
    "This document contains personal wishes, not a binding legal document. Provider listings and prices in this demo are examples and must be independently verified.",
  ].join("\n");
  const url = URL.createObjectURL(new Blob([contents], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "legacycare-my-wishes.txt";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Your wishes have been downloaded as a text file.");
});

document.getElementById("privacy-toast").addEventListener("click", () => {
  showToast("Demo only: information is stored in this browser and is not encrypted or shared with a family member.");
});

document.getElementById("today-date").textContent = new Intl.DateTimeFormat("en-IN", {
  weekday: "long", month: "long", day: "numeric",
}).format(new Date());

renderAll();
