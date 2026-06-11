const ROOM_ID = new URLSearchParams(location.search).get("room") || "terrace";
const STORAGE_NAME_KEY = `menu-user-name-${ROOM_ID}`;
const STORAGE_OPTION_KEY = "menu-default-options";
const STORAGE_ROOM_KEY = `menu-room-data-${ROOM_ID}`;
const IS_FILE_PROTOCOL = location.protocol === "file:";

let userName = localStorage.getItem(STORAGE_NAME_KEY) || "";
let activeCategory = "전체";
let summaryView = "mine";
let roomData = { users: {}, updatedAt: 0 };
let syncTimer = null;
let isSyncing = false;
let serverOnline = !IS_FILE_PROTOCOL;

const defaultOptions = JSON.parse(localStorage.getItem(STORAGE_OPTION_KEY) || "{}");
const mySelections = new Map();

const els = {
  userBar: document.getElementById("userBar"),
  userNameInput: document.getElementById("userNameInput"),
  userNameSave: document.getElementById("userNameSave"),
  roomInfo: document.getElementById("roomInfo"),
  menuNotes: document.getElementById("menuNotes"),
  categoryNav: document.getElementById("categoryNav"),
  menuGrid: document.getElementById("menuGrid"),
  summaryTabs: document.getElementById("summaryTabs"),
  summaryList: document.getElementById("summaryList"),
  summaryCount: document.getElementById("summaryCount"),
  summaryTotal: document.getElementById("summaryTotal"),
  summaryLabel: document.getElementById("summaryLabel"),
  clearBtn: document.getElementById("clearBtn"),
  resetRoomBtn: document.getElementById("resetRoomBtn"),
  summary: document.getElementById("summary"),
  summaryToggle: document.getElementById("summaryToggle"),
  toggleBadge: document.getElementById("toggleBadge"),
  toggleLabel: document.getElementById("toggleLabel"),
  participantCount: document.getElementById("participantCount"),
  serverStatus: document.getElementById("serverStatus"),
};

function showServerStatus(message, isError = true) {
  if (!els.serverStatus) return;
  els.serverStatus.hidden = false;
  els.serverStatus.textContent = message;
  els.serverStatus.classList.toggle("error", isError);
}

function hideServerStatus() {
  if (!els.serverStatus) return;
  els.serverStatus.hidden = true;
}

function loadRoomFromLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_ROOM_KEY) || '{"users":{},"updatedAt":0}');
  } catch {
    return { users: {}, updatedAt: 0 };
  }
}

function saveRoomToLocal(room) {
  localStorage.setItem(STORAGE_ROOM_KEY, JSON.stringify(room));
}

function formatPrice(price) {
  return price.toLocaleString("ko-KR") + "원";
}

function getItemById(itemId) {
  return MENU_ITEMS.find((item) => item.id === itemId);
}

function getSelectedOption(item) {
  if (!item.options) return null;
  return resolveOptionKey(item, defaultOptions[item.id]);
}

function getSelectionUnitPrice(item, optionKey) {
  return getItemPrice(item, optionKey || getDefaultOption(item));
}

function getFilteredItems() {
  if (activeCategory === "전체") return MENU_ITEMS;
  return MENU_ITEMS.filter((item) => item.category === activeCategory);
}

function getMyTotalQuantity() {
  let total = 0;
  for (const qty of mySelections.values()) total += qty;
  return total;
}

function getMyTotalPrice() {
  let total = 0;
  for (const [key, qty] of mySelections) {
    const { itemId, optionKey } = parseSelectionKey(key);
    const item = getItemById(itemId);
    if (item) total += getSelectionUnitPrice(item, optionKey) * qty;
  }
  return total;
}

function selectionsToObject(map) {
  return Object.fromEntries(map.entries());
}

function objectToSelections(object) {
  const map = new Map();
  for (const [key, qty] of Object.entries(object || {})) {
    if (qty > 0) map.set(key, qty);
  }
  return map;
}

function getRoomTotalQuantity() {
  let total = 0;
  for (const user of Object.values(roomData.users)) {
    for (const qty of Object.values(user.selections || {})) total += qty;
  }
  return total;
}

function getRoomTotalPrice() {
  let total = 0;
  for (const user of Object.values(roomData.users)) {
    for (const [key, qty] of Object.entries(user.selections || {})) {
      const { itemId, optionKey } = parseSelectionKey(key);
      const item = getItemById(itemId);
      if (item) total += getSelectionUnitPrice(item, optionKey) * qty;
    }
  }
  return total;
}

async function fetchRoom() {
  const response = await fetch(`/api/room/${encodeURIComponent(ROOM_ID)}`, { cache: "no-store" });
  if (!response.ok) throw new Error("room fetch failed");
  return response.json();
}

async function pushMySelections() {
  if (!userName || isSyncing) return;
  isSyncing = true;
  const payload = {
    selections: selectionsToObject(mySelections),
    updatedAt: Date.now(),
  };

  try {
    if (serverOnline) {
      const response = await fetch(
        `/api/room/${encodeURIComponent(ROOM_ID)}/user/${encodeURIComponent(userName)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error("push failed");
      return;
    }

    roomData = loadRoomFromLocal();
    roomData.users[userName] = payload;
    roomData.updatedAt = payload.updatedAt;
    saveRoomToLocal(roomData);
  } finally {
    isSyncing = false;
  }
}

async function refreshRoom() {
  try {
    if (serverOnline) {
      roomData = await fetchRoom();
      saveRoomToLocal(roomData);
      if (userName) hideServerStatus();
    } else {
      roomData = loadRoomFromLocal();
    }

    if (els.participantCount) {
      els.participantCount.textContent = `${Object.keys(roomData.users || {}).length}명 참여`;
    }
    renderSummary();
  } catch {
    serverOnline = false;
    roomData = loadRoomFromLocal();
    if (els.participantCount) els.participantCount.textContent = "오프라인 모드";
    if (!userName) {
      showServerStatus(
        "서버에 연결되지 않았습니다. start.bat 실행 후 http://localhost:8080 으로 접속해주세요."
      );
    }
    renderSummary();
  }
}

async function checkServer() {
  if (IS_FILE_PROTOCOL) {
    serverOnline = false;
    showServerStatus(
      "파일로 직접 열면 동작하지 않습니다. start.bat을 더블클릭한 뒤 브라우저에서 http://localhost:8080 으로 접속해주세요."
    );
    roomData = loadRoomFromLocal();
    return;
  }

  try {
    const response = await fetch(`/api/room/${encodeURIComponent(ROOM_ID)}`, { cache: "no-store" });
    if (!response.ok) throw new Error("server unavailable");
    serverOnline = true;
    hideServerStatus();
  } catch {
    serverOnline = false;
    roomData = loadRoomFromLocal();
    showServerStatus(
      "서버가 실행 중이 아닙니다. menu 폴더에서 start.bat을 실행한 뒤 http://localhost:8080 으로 접속해주세요."
    );
  }
}

function scheduleSync() {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    await pushMySelections();
    await refreshRoom();
  }, 250);
}

function remindUserName() {
  if (userName) {
    if (els.userBar) els.userBar.classList.remove("needs-name");
    return;
  }
  if (els.userBar) els.userBar.classList.add("needs-name");
  showServerStatus("이름을 저장하면 다른 사람과 선택 내역이 공유됩니다. (지금은 내 메뉴에만 임시 저장)", false);
}

function renderNotes() {
  if (!els.menuNotes) return;
  els.menuNotes.innerHTML = MENU_NOTES.map((note) => `<li>${note}</li>`).join("");
}

function renderCategories() {
  if (!els.categoryNav) return;
  els.categoryNav.innerHTML = CATEGORY_ORDER.map(
    (cat) =>
      `<button type="button" class="category-btn${cat === activeCategory ? " active" : ""}" data-category="${cat}">${cat}</button>`
  ).join("");

  els.categoryNav.querySelectorAll(".category-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.category;
      renderCategories();
      renderMenu();
    });
  });
}

function renderPriceLabel(item) {
  if (item.price != null) return formatPrice(item.price);
  const optionKey = getSelectedOption(item);
  const option = item.options.find((opt) => opt.key === optionKey) || item.options[0];
  const price = item.prices[option.priceKey];
  return `${option.label} ${formatPrice(price)}`;
}

function renderOptionButtons(item) {
  if (!item.options) return "";

  return `<div class="option-group" role="group" aria-label="${item.name} 옵션">
    ${item.options
      .map((option) => {
        const selected = getSelectedOption(item) === option.key;
        const price = item.prices[option.priceKey];
        return `<button type="button" class="option-btn${selected ? " active" : ""}" data-option="${option.key}">
          <span>${option.label}</span>
          <strong>${formatPrice(price)}</strong>
        </button>`;
      })
      .join("")}
  </div>`;
}

function getMyQuantity(item) {
  if (!item.options) return mySelections.get(item.id) || 0;

  let total = 0;
  for (const option of item.options) {
    total += mySelections.get(formatSelectionKey(item.id, option.key)) || 0;
  }
  return total;
}

function createMenuCard(item) {
  const qty = getMyQuantity(item);
  const isSelected = qty > 0;
  const spicyLabel = item.spicy ? `<span class="spicy-badge">${"🌶".repeat(item.spicy)}</span>` : "";

  const card = document.createElement("article");
  card.className = `menu-card${isSelected ? " selected" : ""}${item.image ? "" : " no-image"}`;
  card.dataset.id = item.id;

  const imageBlock = item.image
    ? `<div class="menu-card-image">
        <img src="${item.image}" alt="${item.name}" loading="lazy" referrerpolicy="no-referrer" />
        <span class="menu-card-category">${item.category}</span>
      </div>`
    : `<div class="menu-card-image menu-card-placeholder">
        <span class="menu-card-category">${item.category}</span>
        <span class="placeholder-text">메뉴</span>
      </div>`;

  card.innerHTML = `
    ${imageBlock}
    <div class="menu-card-body">
      <div class="menu-card-top">
        <input type="checkbox" class="menu-checkbox" id="check-${item.id}" ${isSelected ? "checked" : ""} aria-label="${item.name} 선택" />
        <div class="menu-card-info">
          <h3 class="menu-card-name">${item.name}${spicyLabel}</h3>
          <p class="menu-card-desc">${item.description}</p>
        </div>
      </div>
      ${renderOptionButtons(item)}
      <p class="menu-card-price">${renderPriceLabel(item)}</p>
      <div class="menu-card-actions">
        <button type="button" class="btn-qty btn-minus" aria-label="수량 감소" ${qty === 0 ? "disabled" : ""}>−</button>
        <button type="button" class="btn-select${isSelected ? " added" : ""}">${isSelected ? `선택됨 (${qty})` : "선택"}</button>
        <button type="button" class="btn-qty btn-plus" aria-label="수량 증가">+</button>
      </div>
    </div>
  `;

  const checkbox = card.querySelector(".menu-checkbox");
  const btnSelect = card.querySelector(".btn-select");
  const btnMinus = card.querySelector(".btn-minus");
  const btnPlus = card.querySelector(".btn-plus");

  card.querySelectorAll(".option-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      defaultOptions[item.id] = btn.dataset.option;
      localStorage.setItem(STORAGE_OPTION_KEY, JSON.stringify(defaultOptions));
      renderMenu();
    });
  });

  checkbox.addEventListener("change", () => {
    remindUserName();
    if (checkbox.checked) changeQuantity(item, 1);
    else clearItemSelections(item);
  });

  btnSelect.addEventListener("click", () => {
    remindUserName();
    changeQuantity(item, getActiveQuantity(item) + 1);
  });

  btnMinus.addEventListener("click", () => {
    remindUserName();
    changeQuantity(item, Math.max(getActiveQuantity(item) - 1, 0));
  });

  btnPlus.addEventListener("click", () => {
    remindUserName();
    changeQuantity(item, getActiveQuantity(item) + 1);
  });

  return card;
}

function getActiveQuantity(item) {
  const key = getItemSelectionKey(item);
  return mySelections.get(key) || 0;
}

function getItemSelectionKey(item) {
  if (!item.options) return item.id;
  return formatSelectionKey(item.id, getSelectedOption(item));
}

function changeQuantity(item, qty) {
  const key = getItemSelectionKey(item);
  if (qty <= 0) mySelections.delete(key);
  else mySelections.set(key, qty);
  renderMenu();
  renderSummary();
  scheduleSync();
}

function clearItemSelections(item) {
  if (!item.options) {
    mySelections.delete(item.id);
  } else {
    for (const option of item.options) {
      mySelections.delete(formatSelectionKey(item.id, option.key));
    }
  }
  renderMenu();
  renderSummary();
  scheduleSync();
}

function renderMenu() {
  if (!els.menuGrid) return;
  const items = getFilteredItems();
  els.menuGrid.innerHTML = "";
  items.forEach((item) => {
    try {
      els.menuGrid.appendChild(createMenuCard(item));
    } catch (error) {
      console.error("메뉴 카드 렌더링 실패:", item.id, error);
    }
  });
}

function buildSelectionRows(sourceMap, showUser) {
  const rows = [];

  if (showUser) {
    for (const [name, user] of Object.entries(roomData.users || {})) {
      for (const [key, qty] of Object.entries(user.selections || {})) {
        if (qty <= 0) continue;
        const { itemId, optionKey } = parseSelectionKey(key);
        const item = getItemById(itemId);
        if (!item) continue;
        rows.push({ userName: name, item, optionKey, qty });
      }
    }
    rows.sort((a, b) => a.userName.localeCompare(b.userName, "ko"));
    return rows;
  }

  for (const [key, qty] of sourceMap.entries()) {
    if (qty <= 0) continue;
    const { itemId, optionKey } = parseSelectionKey(key);
    const item = getItemById(itemId);
    if (!item) continue;
    rows.push({ item, optionKey, qty });
  }
  return rows;
}

function getOptionLabel(item, optionKey) {
  if (!item.options || !optionKey) return "";
  const option = item.options.find((opt) => opt.key === optionKey);
  return option ? option.label : "";
}

function renderSummary() {
  if (!els.summaryList || !els.summaryCount || !els.summaryTotal) return;

  const isMine = summaryView === "mine";
  const rows = isMine ? buildSelectionRows(mySelections, false) : buildSelectionRows(null, true);
  const totalQty = isMine ? getMyTotalQuantity() : getRoomTotalQuantity();
  const totalPrice = isMine ? getMyTotalPrice() : getRoomTotalPrice();

  els.summaryCount.textContent = `${totalQty}개`;
  els.summaryTotal.textContent = formatPrice(totalPrice);
  els.toggleBadge.textContent = String(isMine ? totalQty : getRoomTotalQuantity());
  els.clearBtn.disabled = !isMine || totalQty === 0;
  els.resetRoomBtn.disabled = !userName;
  els.summaryLabel.textContent = isMine ? "내 총 금액" : "전체 총 금액";

  if (rows.length === 0) {
    els.summaryList.innerHTML = `<p class="summary-empty">${isMine ? "아직 선택한 메뉴가 없습니다." : "아직 참여자가 없습니다."}</p>`;
    return;
  }

  els.summaryList.innerHTML = rows
    .map(({ userName: name, item, optionKey, qty }) => {
      const optionLabel = getOptionLabel(item, optionKey);
      const unitPrice = getSelectionUnitPrice(item, optionKey);
      const thumb = item.image
        ? `<img class="summary-item-thumb" src="${item.image}" alt="" referrerpolicy="no-referrer" />`
        : `<div class="summary-item-thumb placeholder">메뉴</div>`;

      return `<div class="summary-item" data-key="${formatSelectionKey(item.id, optionKey)}">
        ${thumb}
        <div class="summary-item-info">
          ${name ? `<p class="summary-item-user">${name}</p>` : ""}
          <p class="summary-item-name">${item.name}</p>
          <p class="summary-item-meta">${optionLabel ? `${optionLabel} · ` : ""}${qty}개 × ${formatPrice(unitPrice)}</p>
        </div>
        ${isMine ? `<button type="button" class="summary-item-remove" aria-label="${item.name} 제거">×</button>` : ""}
      </div>`;
    })
    .join("");

  if (isMine) {
    els.summaryList.querySelectorAll(".summary-item-remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.closest(".summary-item").dataset.key;
        mySelections.delete(key);
        renderMenu();
        renderSummary();
        scheduleSync();
      });
    });
  }
}

function toggleSummaryPanel() {
  const isOpen = els.summary.classList.toggle("open");
  els.summaryToggle.setAttribute("aria-expanded", String(isOpen));
  els.toggleLabel.textContent = isOpen ? "닫기" : "주문 보기";
}

async function loadMySelectionsFromRoom() {
  if (!userName) return;
  let room = roomData;
  if (serverOnline) {
    try {
      room = await fetchRoom();
      roomData = room;
      saveRoomToLocal(room);
    } catch {
      room = loadRoomFromLocal();
      roomData = room;
    }
  }
  const mine = room.users?.[userName]?.selections;
  mySelections.clear();
  if (mine) objectToSelections(mine).forEach((qty, key) => mySelections.set(key, qty));
  renderMenu();
  renderSummary();
}

function saveUserName() {
  const value = els.userNameInput?.value.trim();
  if (!value) {
    showServerStatus("이름을 입력해주세요.", true);
    return;
  }
  userName = value;
  localStorage.setItem(STORAGE_NAME_KEY, userName);
  if (els.userBar) els.userBar.classList.remove("needs-name");
  hideServerStatus();
  loadMySelectionsFromRoom().then(scheduleSync);
}

if (els.userNameSave) els.userNameSave.addEventListener("click", saveUserName);
if (els.userNameInput) {
  els.userNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") saveUserName();
  });
}

if (els.summaryTabs) els.summaryTabs.querySelectorAll(".summary-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    summaryView = tab.dataset.view;
    els.summaryTabs.querySelectorAll(".summary-tab").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.view === summaryView);
    });
    renderSummary();
  });
});

if (els.clearBtn) els.clearBtn.addEventListener("click", () => {
  mySelections.clear();
  renderMenu();
  renderSummary();
  scheduleSync();
});

if (els.resetRoomBtn) {
  els.resetRoomBtn.addEventListener("click", async () => {
    if (!confirm("모든 참여자의 선택을 초기화할까요?")) return;
    if (serverOnline) {
      await fetch(`/api/room/${encodeURIComponent(ROOM_ID)}`, { method: "DELETE" });
    }
    localStorage.removeItem(STORAGE_ROOM_KEY);
    mySelections.clear();
    await refreshRoom();
    renderMenu();
  });
}

if (els.summaryToggle) els.summaryToggle.addEventListener("click", toggleSummaryPanel);

async function init() {
  const menuTotalEl = document.getElementById("menuTotal");
  if (menuTotalEl) menuTotalEl.textContent = String(MENU_ITEMS.length);
  if (els.roomInfo) {
    els.roomInfo.textContent = `방 코드: ${ROOM_ID}`;
    els.roomInfo.href = `${location.pathname}?room=${encodeURIComponent(ROOM_ID)}`;
  }
  if (els.userNameInput && userName) els.userNameInput.value = userName;

  renderNotes();
  renderCategories();
  renderMenu();
  renderSummary();

  await checkServer();
  await refreshRoom();
  if (userName) await loadMySelectionsFromRoom();
  setInterval(refreshRoom, 3000);
}

init().catch((error) => {
  console.error(error);
  showServerStatus("페이지를 불러오는 중 오류가 발생했습니다. 새로고침 후 다시 시도해주세요.");
});
