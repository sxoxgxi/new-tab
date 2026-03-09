// Theme toggle
const theme = document.getElementById("theme");
const btn = document.getElementById("themeToggle");

function getThemeName(href) {
  return href.split("/").pop().replace(".css", "").replace(/-/g, " ");
}

function updateButtonText() {
  const currentHref = theme.getAttribute("href");
  btn.textContent = "using " + getThemeName(currentHref);
}

btn.onclick = () => {
  const current = theme.getAttribute("href");
  const next = current.includes("rosepine")
    ? "themes/catppuccin.css"
    : "themes/rosepine.css";

  theme.href = next;
  localStorage.setItem("theme", next);
  updateButtonText();
};

const saved = localStorage.getItem("theme");
if (saved) {
  theme.href = saved;
}
updateButtonText();

// Clock
function updateClock() {
  const now = new Date();
  document.getElementById("time").textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  document.getElementById("date").textContent = now.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
updateClock();
setInterval(updateClock, 1000);

// Modal
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const nameInput = document.getElementById("nameInput");
const descInput = document.getElementById("descInput");
const urlInput = document.getElementById("urlInput");
const cancelBtn = document.getElementById("cancelBtn");
const submitBtn = document.getElementById("submitBtn");

let currentEditIndex = null;

function showModal(
  title,
  data = { name: "", desc: "", url: "" },
  index = null,
) {
  modalTitle.textContent = title;
  nameInput.value = data.name || "";
  descInput.value = data.desc || "";
  urlInput.value = data.url || "";
  currentEditIndex = index;
  modal.classList.remove("hidden");
  nameInput.focus();
}

function closeModal() {
  modal.classList.add("hidden");
  currentEditIndex = null;
}

cancelBtn.addEventListener("click", closeModal);

submitBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  const desc = descInput.value.trim();
  const url = urlInput.value.trim();

  if (!name || !url) {
    alert("Title and URL are required.");
    return;
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    urlInput.value = "https://" + url;
  }

  const linkData = { name, desc, url: urlInput.value };

  if (currentEditIndex !== null) {
    links[currentEditIndex] = linkData;
  } else {
    links.push(linkData);
  }

  saveLinks();
  renderLinks();
  closeModal();
});

// Quick Links
const initialDefaults = [
  { name: "X", desc: "timeline", url: "https://x.com/home" },
  { name: "GitHub", desc: "code & projects", url: "https://github.com" },
  { name: "Gmail", desc: "inbox", url: "https://mail.google.com" },
  { name: "YouTube", desc: "videos", url: "https://www.youtube.com" },
  { name: "Reddit", desc: "news & communities", url: "https://www.reddit.com" },
  { name: "ChatGPT", desc: "AI assistant", url: "https://chatgpt.com" },
];

const LINKS_STORAGE_KEY = "quickLinks_v1";
let links = [];

const linksGrid = document.getElementById("linksGrid");
const addLinkBtn = document.getElementById("addLinkBtn");

function loadLinks() {
  const saved = localStorage.getItem(LINKS_STORAGE_KEY);
  if (saved) {
    links = JSON.parse(saved);
  } else {
    links = [...initialDefaults];
    saveLinks();
  }
  renderLinks();
}

function saveLinks() {
  localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(links));
}

function renderLinks() {
  linksGrid.innerHTML = "";

  links.forEach((link, index) => {
    const tile = document.createElement("div");
    tile.draggable = true;
    tile.dataset.index = index;
    tile.className =
      "group relative bg-surface border border-overlay rounded-xl p-5 hover:border-muted hover:bg-overlay transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-1 cursor-grab active:cursor-grabbing";

    tile.innerHTML = `
            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2.5">
              <button class="edit-btn text-muted hover:text-foam text-base" title="Edit">✎</button>
              <button class="delete-btn text-muted hover:text-love text-xl leading-none" title="Delete">×</button>
            </div>
            <div class="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move text-muted text-xl leading-none">⠿</div>
            <a href="${link.url}" target="_blank" class="block">
              <div class="text-foam font-medium text-lg">${link.name}</div>
              ${link.desc ? `<div class="text-muted text-sm mt-1">${link.desc}</div>` : ""}
            </a>
          `;

    const linkEl = tile.querySelector("a");
    linkEl.addEventListener("mousedown", (e) => e.stopPropagation());

    tile.querySelector(".edit-btn").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      showModal("Edit Quick Link", link, index);
    });

    // Delete
    tile.querySelector(".delete-btn").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (confirm(`Remove "${link.name}"?`)) {
        links.splice(index, 1);
        saveLinks();
        renderLinks();
      }
    });

    linksGrid.appendChild(tile);
  });

  initDragAndDrop();
}

function initDragAndDrop() {
  const items = linksGrid.querySelectorAll("[draggable]");
  items.forEach((item) => {
    item.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", item.dataset.index);
      item.classList.add("opacity-60", "scale-105", "ring-2", "ring-foam");
    });

    item.addEventListener("dragend", () => {
      item.classList.remove("opacity-60", "scale-105", "ring-2", "ring-foam");
      document
        .querySelectorAll(".drag-over")
        .forEach((el) => el.classList.remove("drag-over"));
    });

    item.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (e.dataTransfer.getData("text/plain") !== item.dataset.index) {
        item.classList.add("drag-over");
      }
    });

    item.addEventListener("dragleave", () => {
      item.classList.remove("drag-over");
    });

    item.addEventListener("drop", (e) => {
      e.preventDefault();
      const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
      const toIndex = parseInt(item.dataset.index);

      if (fromIndex === toIndex) return;

      const [moved] = links.splice(fromIndex, 1);
      links.splice(toIndex, 0, moved);

      saveLinks();
      renderLinks();
    });
  });
}

addLinkBtn.addEventListener("click", () => {
  showModal("Add Quick Link");
});

// Search Engines
const defaultEngines = [
  { name: "DuckDuckGo", url: "https://duckduckgo.com/?q=%s" },
  { name: "Google", url: "https://www.google.com/search?q=%s" },
  { name: "Brave", url: "https://search.brave.com/search?q=%s" },
];
const ENGINES_STORAGE_KEY = "customSearchEngines";
const SELECTED_KEY = "selectedEngineIndex";
let engines = [...defaultEngines];
let selectedIndex = 0;
const selectEl = document.getElementById("engineSelect");
const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const addEngineBtn = document.getElementById("addEngineBtn");

function loadEngines() {
  const saved = localStorage.getItem(ENGINES_STORAGE_KEY);
  if (saved) engines = [...defaultEngines, ...JSON.parse(saved)];
  const savedIndex = localStorage.getItem(SELECTED_KEY);
  selectedIndex = savedIndex ? parseInt(savedIndex, 10) : 0;
  if (selectedIndex >= engines.length) selectedIndex = 0;
  renderEngineOptions();
  selectEl.selectedIndex = selectedIndex;
}

function renderEngineOptions() {
  selectEl.innerHTML = "";
  engines.forEach((eng, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = eng.name;
    selectEl.appendChild(opt);
  });
}

function saveSelected() {
  localStorage.setItem(SELECTED_KEY, selectEl.selectedIndex);
}

function performSearch() {
  const query = input.value.trim();
  if (!query) return;
  const engine = engines[selectEl.value];
  if (!engine) return;
  const url = engine.url.replace("%s", encodeURIComponent(query));
  window.location.href = url;
}

selectEl.addEventListener("change", saveSelected);
form.addEventListener("submit", (e) => {
  e.preventDefault();
  performSearch();
});
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    performSearch();
  }
});

const engineModal = document.getElementById("engineModal");
const engineNameInput = document.getElementById("engineNameInput");
const engineUrlInput = document.getElementById("engineUrlInput");
const engineCancelBtn = document.getElementById("engineCancelBtn");
const engineSubmitBtn = document.getElementById("engineSubmitBtn");

addEngineBtn.addEventListener("click", () => {
  engineNameInput.value = "";
  engineUrlInput.value = "";
  engineModal.classList.remove("hidden");
  engineNameInput.focus();
});

engineCancelBtn.addEventListener("click", () => {
  engineModal.classList.add("hidden");
});

engineSubmitBtn.addEventListener("click", () => {
  const name = engineNameInput.value.trim();
  const url = engineUrlInput.value.trim();

  if (!name) {
    alert("Engine name is required");
    return;
  }

  if (!url || !url.includes("%s")) {
    alert("URL must contain %s");
    return;
  }

  engines.push({ name, url });

  const customOnly = engines.slice(defaultEngines.length);
  localStorage.setItem(ENGINES_STORAGE_KEY, JSON.stringify(customOnly));

  renderEngineOptions();
  selectEl.selectedIndex = engines.length - 1;
  saveSelected();

  engineModal.classList.add("hidden");
});

function updateGreeting() {
  const hour = new Date().getHours();

  const greetings = {
    dawn: [
      { title: "rise and shine", subtitle: "make today count" },
      { title: "good morning", subtitle: "fresh start awaits" },
      { title: "new day", subtitle: "what will you create?" },
      { title: "morning energy", subtitle: "seize the moment" },
      { title: "dawn breaks", subtitle: "possibilities ahead" },
    ],
    midday: [
      { title: "keep going", subtitle: "you're doing great" },
      { title: "afternoon vibes", subtitle: "stay focused" },
      { title: "halfway there", subtitle: "momentum building" },
      { title: "power through", subtitle: "you've got this" },
      { title: "stay sharp", subtitle: "finish strong" },
    ],
    twilight: [
      { title: "golden hour", subtitle: "reflect and recharge" },
      { title: "evening energy", subtitle: "what's next?" },
      { title: "wind down", subtitle: "day well spent" },
      { title: "twilight time", subtitle: "almost there" },
      { title: "sunset mode", subtitle: "celebrate progress" },
    ],
    night: [
      { title: "night owl", subtitle: "create in the quiet" },
      { title: "late night", subtitle: "ideas flow freely" },
      { title: "moonlight hours", subtitle: "peace and focus" },
      { title: "still going", subtitle: "dedication pays off" },
      { title: "midnight magic", subtitle: "own the night" },
    ],
  };

  let selectedGreeting;
  if (hour >= 5 && hour < 12) {
    selectedGreeting =
      greetings.dawn[Math.floor(Math.random() * greetings.dawn.length)];
  } else if (hour >= 12 && hour < 18) {
    selectedGreeting =
      greetings.midday[Math.floor(Math.random() * greetings.midday.length)];
  } else if (hour >= 18 && hour < 22) {
    selectedGreeting =
      greetings.twilight[Math.floor(Math.random() * greetings.twilight.length)];
  } else {
    selectedGreeting =
      greetings.night[Math.floor(Math.random() * greetings.night.length)];
  }

  document.querySelector("h1").textContent = selectedGreeting.title;
  document.querySelector("header p").textContent = selectedGreeting.subtitle;
  document.title = selectedGreeting.title;
}

updateGreeting();
setInterval(updateGreeting, 60000);

// Init
loadEngines();
loadLinks();
input.focus();
