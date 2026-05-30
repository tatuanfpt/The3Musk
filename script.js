// State Management
const colors = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-orange-500",
];

let state = {
  members: JSON.parse(localStorage.getItem("3musk_members")) || [
    { id: 1, name: "Athos", color: colors[0], avatar: "A" },
    { id: 2, name: "Porthos", color: colors[1], avatar: "P" },
    { id: 3, name: "Aramis", color: colors[2], avatar: "Ar" },
  ],
  tasks: JSON.parse(localStorage.getItem("3musk_tasks")) || [],
  okrs: JSON.parse(localStorage.getItem("3musk_okrs")) || [],
  aiEnabled: JSON.parse(localStorage.getItem("3musk_aiEnabled")) ?? true,
  darkMode: JSON.parse(localStorage.getItem("3musk_darkMode")) || false,
  currentUser: JSON.parse(localStorage.getItem("3musk_currentUser")) || null, // For review purposes - we'll use this to track who's approving
};

let taskView = JSON.parse(localStorage.getItem("3musk_taskView")) || {
  sortMode: "manual",
  keyword: "",
  filters: { priority: "all", progress: "all", complexity: "all" },
  sort: [
    { field: "score", dir: "desc" },
    { field: "none", dir: "desc" },
    { field: "none", dir: "desc" },
  ],
};

function saveTaskView() {
  localStorage.setItem("3musk_taskView", JSON.stringify(taskView));
}
// Initialize current user (just pick first member for demo)
if (state.members.length > 0 && !state.currentUser) {
  state.currentUser = state.members[0].id.toString();
}

// DOM Elements
const taskModal = document.getElementById("task-modal");
const taskForm = document.getElementById("task-form");
const addTaskBtn = document.getElementById("add-task-btn");
const closeModalBtn = document.getElementById("close-modal");
const currentUserSelect = document.getElementById("current-user-select");
const taskAssigneeSelect = document.getElementById("task-assignee");
const memberModal = document.getElementById("member-modal");
const memberForm = document.getElementById("member-form");
const manageMembersBtn = document.getElementById("manage-members-btn");
const closeMemberModalBtn = document.getElementById("close-member-modal");
const memberList = document.getElementById("member-list");
const darkModeBtn = document.getElementById("dark-mode-btn");
const exportBtn = document.getElementById("export-btn");
const importFile = document.getElementById("import-file");
const taskDetailModal = document.getElementById("task-detail-modal");
const closeTaskDetailModalBtn = document.getElementById(
  "close-task-detail-modal",
);
const focusModeOverlay = document.getElementById("focus-mode-overlay");
const closeFocusModeBtn = document.getElementById("close-focus-mode-btn");
const focusModeTask = document.getElementById("focus-mode-task");
const reviewModal = document.getElementById("review-modal");
const closeReviewModalBtn = document.getElementById("close-review-modal");
const reviewForm = document.getElementById("review-form");
const approveReviewBtn = document.getElementById("approve-review-btn");
const rejectReviewBtn = document.getElementById("reject-review-btn");
const okrCard = document.getElementById("okr-card");
const okrList = document.getElementById("okr-list");
const addOkrBtn = document.getElementById("add-okr-btn");
const okrModal = document.getElementById("okr-modal");
const okrForm = document.getElementById("okr-form");
const closeOkrModalBtn = document.getElementById("close-okr-modal");
const cancelOkrBtn = document.getElementById("cancel-okr-btn");
const addKrBtn = document.getElementById("add-kr-btn");
const krList = document.getElementById("kr-list");
const aiPanel = document.getElementById("ai-panel");
const aiAssistantBtn = document.getElementById("ai-assistant-btn");
const closeAiPanelBtn = document.getElementById("close-ai-panel");
const aiToggleBtn = document.getElementById("ai-toggle-btn");
const aiTabOneThing = document.getElementById("ai-tab-onething");
const aiTabWorkspace = document.getElementById("ai-tab-workspace");
const aiFocusBtn = document.getElementById("ai-focus-btn");
const aiForm = document.getElementById("ai-form");
const aiInput = document.getElementById("ai-input");
const sendAiBtn = document.getElementById("send-ai-query");
const aiMessages = document.getElementById("ai-messages");

// Initialize
function init() {
  ensureDemoData();
  applyDarkMode();
  renderMembers();
  renderOKRs();
  ensureTaskOrder();
  renderTasks();
  setupEventListeners();
  setupKanbanDragAndDrop();
  initAiAssistant();
}

// Save state to localStorage
function saveState() {
  localStorage.setItem("3musk_members", JSON.stringify(state.members));
  localStorage.setItem("3musk_tasks", JSON.stringify(state.tasks));
  localStorage.setItem("3musk_okrs", JSON.stringify(state.okrs));
  localStorage.setItem("3musk_aiEnabled", JSON.stringify(state.aiEnabled));
  localStorage.setItem("3musk_darkMode", JSON.stringify(state.darkMode));
  localStorage.setItem("3musk_currentUser", JSON.stringify(state.currentUser));
}

function ensureDemoData() {
  const seedKey = "3musk_seed_version";
  if (localStorage.getItem(seedKey)) return;
  if (Array.isArray(state.tasks) && state.tasks.length > 0) {
    localStorage.setItem(seedKey, "1");
    return;
  }
  seedDemoData();
  localStorage.setItem(seedKey, "1");
}

function seedDemoData() {
  const members = [
    { id: "101", name: "Tuấn", color: colors[0], avatar: "T" },
    { id: "102", name: "Thắng", color: colors[1], avatar: "Th" },
    { id: "103", name: "Nhật", color: colors[2], avatar: "N" },
  ];

  const now = new Date();
  const dateOffset = (days) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  state.members = members;
  state.currentUser = "101";
  state.okrs = [
    {
      id: "okr-1",
      title: "Ship demo Productivity Enhancement",
      ownerId: "101",
      krs: [
        {
          id: "kr-1",
          title: "Hoàn thiện AI Assistant (local-first)",
          done: true,
        },
        { id: "kr-2", title: "Đảm bảo workflow Review trước Done", done: true },
        {
          id: "kr-3",
          title: "Chuẩn bị demo script + QC checklist",
          done: false,
        },
      ],
      createdAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
    },
  ];

  state.tasks = [
    {
      id: "demo-1",
      title: "Chuẩn hoá backlog theo Epic/FR",
      description: "Mapping BR/FR từ REQUIREMENTS.md, tạo task theo từng epic.",
      assigneeId: "101",
      deadline: dateOffset(0),
      status: "progress",
      order: 1,
      createdAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
      reviewedBy: [],
    },
    {
      id: "demo-2",
      title: "Thiết kế AI output có cấu trúc (Context/Summary/Groups)",
      description:
        "Hỗ trợ hỏi không chuẩn, tìm task theo người, nhóm theo deadline/status.",
      assigneeId: "103",
      deadline: dateOffset(1),
      status: "todo",
      order: 2,
      createdAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
      reviewedBy: [],
    },
    {
      id: "demo-3",
      title: "Fix BR-03: chặn Done nếu chưa approve",
      description: "Task ở Review phải được người khác approve trước khi Done.",
      assigneeId: "102",
      deadline: dateOffset(-1),
      status: "review",
      order: 1,
      createdAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
      reviewedBy: [],
    },
    {
      id: "demo-4",
      title: "QC: kiểm thử import/export và edge cases",
      description:
        "Import JSON sai format, thiếu field; export đầy đủ; không crash UI.",
      assigneeId: "101",
      deadline: dateOffset(2),
      status: "review",
      order: 2,
      createdAt: new Date(now.getTime() - 6 * 86400000).toISOString(),
      reviewedBy: ["102"],
    },
    {
      id: "demo-5",
      title: "Dark/Light mode polish",
      description: "Đảm bảo UI đồng nhất và không lỗi khi toggle liên tục.",
      assigneeId: "103",
      deadline: "",
      status: "done",
      order: 1,
      createdAt: new Date(now.getTime() - 8 * 86400000).toISOString(),
      reviewedBy: ["101"],
    },
    {
      id: "demo-6",
      title: "Viết demo script + ROI points",
      description: "Nêu rõ time saved, error reduction, process efficiency.",
      assigneeId: "102",
      deadline: dateOffset(3),
      status: "todo",
      order: 3,
      createdAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
      reviewedBy: [],
    },
  ];

  saveState();
}

// Dark Mode
function applyDarkMode() {
  const body = document.body;
  const navbar = document.getElementById("navbar");
  const statCards = [
    document.getElementById("stat-total-card"),
    document.getElementById("stat-progress-card"),
    document.getElementById("stat-review-card"),
    document.getElementById("stat-done-card"),
  ];
  const cards = [okrCard, ...statCards].filter(Boolean);
  const taskModalContent = document.getElementById("task-modal-content");
  const memberModalContent = document.getElementById("member-modal-content");
  const taskDetailModalContent = document.getElementById(
    "task-detail-modal-content",
  );
  const reviewModalContent = document.getElementById("review-modal-content");
  const okrModalContent = document.getElementById("okr-modal-content");
  const inputs = document.querySelectorAll("input, textarea, select");

  if (state.darkMode) {
    body.classList.add("dark");
    body.classList.add("bg-gray-900", "text-white");
    body.classList.remove("bg-gray-50", "text-gray-900");
    navbar.classList.add("bg-gray-800", "border-gray-700");
    navbar.classList.remove("bg-white", "border-gray-200");
    cards.forEach((card) => {
      card.classList.add("bg-gray-800", "border-gray-700");
      card.classList.remove("bg-white", "border-gray-200");
      const p = card.querySelector("p");
      if (p) {
        p.classList.add("text-gray-400");
        p.classList.remove("text-gray-500");
      }
    });
    taskModalContent.classList.add("bg-gray-800");
    taskModalContent.classList.remove("bg-white");
    memberModalContent.classList.add("bg-gray-800");
    memberModalContent.classList.remove("bg-white");
    taskDetailModalContent.classList.add("bg-gray-800");
    taskDetailModalContent.classList.remove("bg-white");
    if (reviewModalContent) {
      reviewModalContent.classList.add("bg-gray-800");
      reviewModalContent.classList.remove("bg-white");
    }
    if (okrModalContent) {
      okrModalContent.classList.add("bg-gray-800");
      okrModalContent.classList.remove("bg-white");
    }
    inputs.forEach((input) => {
      input.classList.add("bg-gray-700", "text-white", "border-gray-600");
      input.classList.remove("bg-white", "text-gray-900", "border-gray-300");
    });
    darkModeBtn.innerHTML = '<i class="lucide-moon"></i>';
  } else {
    body.classList.remove("dark");
    body.classList.remove("bg-gray-900", "text-white");
    body.classList.add("bg-gray-50", "text-gray-900");
    navbar.classList.remove("bg-gray-800", "border-gray-700");
    navbar.classList.add("bg-white", "border-gray-200");
    cards.forEach((card) => {
      card.classList.remove("bg-gray-800", "border-gray-700");
      card.classList.add("bg-white", "border-gray-200");
      const p = card.querySelector("p");
      if (p) {
        p.classList.remove("text-gray-400");
        p.classList.add("text-gray-500");
      }
    });
    taskModalContent.classList.remove("bg-gray-800");
    taskModalContent.classList.add("bg-white");
    memberModalContent.classList.remove("bg-gray-800");
    memberModalContent.classList.add("bg-white");
    taskDetailModalContent.classList.remove("bg-gray-800");
    taskDetailModalContent.classList.add("bg-white");
    if (reviewModalContent) {
      reviewModalContent.classList.remove("bg-gray-800");
      reviewModalContent.classList.add("bg-white");
    }
    if (okrModalContent) {
      okrModalContent.classList.remove("bg-gray-800");
      okrModalContent.classList.add("bg-white");
    }
    inputs.forEach((input) => {
      input.classList.remove("bg-gray-700", "text-white", "border-gray-600");
      input.classList.add("bg-white", "text-gray-900", "border-gray-300");
    });
    darkModeBtn.innerHTML = '<i class="lucide-sun"></i>';
  }
}

// Render Members
function renderMembers() {
  currentUserSelect.innerHTML = state.members
    .map((m) => `<option value="${m.id}">${m.name}</option>`)
    .join("");
  if (state.currentUser) {
    currentUserSelect.value = state.currentUser;
  }

  // Render task assignee select
  taskAssigneeSelect.innerHTML = state.members
    .map(
      (m) => `
    <option value="${m.id}">${m.name}</option>
  `,
    )
    .join("");

  // Render member management list
  renderMemberList();
}

function renderMemberList() {
  memberList.innerHTML = state.members
    .map(
      (m) => `
    <div class="flex items-center justify-between p-3 bg-gray-100 rounded-lg dark:bg-gray-700">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full ${m.color} text-white flex items-center justify-center text-xs font-bold">
          ${m.avatar}
        </div>
        <span class="font-medium">${m.name}</span>
      </div>
      <div class="flex gap-2">
        <button onclick="editMember(${m.id})" class="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
          <i class="lucide-edit text-sm"></i>
        </button>
        <button onclick="deleteMember(${m.id})" class="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-red-500">
          <i class="lucide-trash-2 text-sm"></i>
        </button>
      </div>
    </div>
  `,
    )
    .join("");
}

function computeOkrProgress(okr) {
  const krs = Array.isArray(okr.krs) ? okr.krs : [];
  if (krs.length === 0) return 0;
  const ratios = krs.map((kr) => {
    const target = Number(kr.target) || 0;
    const current = Number(kr.current) || 0;
    if (target <= 0) return 0;
    return Math.max(0, Math.min(1, current / target));
  });
  return ratios.reduce((sum, r) => sum + r, 0) / ratios.length;
}

function renderOKRs() {
  if (!okrList) return;

  if (!Array.isArray(state.okrs) || state.okrs.length === 0) {
    okrList.innerHTML = `
      <div class="col-span-full p-6 rounded-xl border border-dashed border-gray-200 text-sm text-gray-500 flex items-center justify-center">
        Chưa có OKR nào. Bấm “Thêm OKR” để bắt đầu.
      </div>
    `;
    return;
  }

  okrList.innerHTML = state.okrs
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .map((okr) => {
      const progress = computeOkrProgress(okr);
      const pct = Math.round(progress * 100);
      const krs = Array.isArray(okr.krs) ? okr.krs : [];
      const krLines =
        krs.length === 0
          ? `<div class="text-xs text-gray-500">Chưa có Key Result</div>`
          : krs
              .map((kr) => {
                const target = Number(kr.target) || 0;
                const current = Number(kr.current) || 0;
                const krPct =
                  target > 0
                    ? Math.round((Math.min(current, target) / target) * 100)
                    : 0;
                return `
                  <div class="text-xs text-gray-600">
                    <div class="flex items-center justify-between gap-3">
                      <span class="font-semibold truncate">${kr.title || "KR"}</span>
                      <span class="shrink-0">${current}/${target}</span>
                    </div>
                    <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                      <div class="h-full bg-indigo-500" style="width:${krPct}%"></div>
                    </div>
                  </div>
                `;
              })
              .join("");

      return `
        <div class="p-5 rounded-xl border border-gray-200 bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="min-w-0">
              <h3 class="font-bold text-gray-900 truncate dark:text-white">${okr.title}</h3>
              <p class="text-sm text-gray-500 line-clamp-2 dark:text-gray-300">${okr.description || ""}</p>
            </div>
            <div class="flex gap-1 shrink-0">
              <button onclick="editOkr('${okr.id}')" class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <i class="lucide-edit text-sm text-gray-500"></i>
              </button>
              <button onclick="deleteOkr('${okr.id}')" class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <i class="lucide-trash-2 text-sm text-red-500"></i>
              </button>
            </div>
          </div>
          <div class="flex items-center justify-between gap-3 mb-2">
            <span class="text-xs font-bold text-gray-600 dark:text-gray-300">Tiến độ</span>
            <span class="text-xs font-bold text-indigo-600">${pct}%</span>
          </div>
          <div class="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
            <div class="h-full bg-indigo-600" style="width:${pct}%"></div>
          </div>
          <div class="space-y-3">${krLines}</div>
        </div>
      `;
    })
    .join("");

  applyDarkMode();
}

function openOkrModal(okrId = null) {
  const modalTitle = document.getElementById("okr-modal-title");
  const okrIdInput = document.getElementById("okr-id");
  const titleInput = document.getElementById("okr-title");
  const descInput = document.getElementById("okr-description");

  krList.innerHTML = "";

  if (okrId) {
    const okr = state.okrs.find((o) => o.id === okrId);
    if (!okr) return;
    modalTitle.textContent = "Chỉnh sửa OKR";
    okrIdInput.value = okr.id;
    titleInput.value = okr.title;
    descInput.value = okr.description || "";
    (okr.krs || []).forEach((kr) => addKrRow(kr));
  } else {
    modalTitle.textContent = "Thêm OKR";
    okrForm.reset();
    okrIdInput.value = "";
    addKrRow();
  }

  okrModal.classList.remove("hidden");
  applyDarkMode();
}

function closeOkrModal() {
  okrModal.classList.add("hidden");
  okrForm.reset();
  krList.innerHTML = "";
}

function addKrRow(kr = null) {
  const row = document.createElement("div");
  row.className =
    "grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-3 rounded-xl bg-gray-50 border border-gray-200 dark:bg-gray-900/30 dark:border-gray-700";
  row.dataset.krRow = "true";
  const id =
    kr?.id || Date.now().toString() + Math.random().toString(16).slice(2);

  row.innerHTML = `
    <div class="md:col-span-6">
      <label class="block text-xs font-bold text-gray-600 mb-1">Tên KR</label>
      <input data-kr-field="title" data-kr-id="${id}" type="text" value="${kr?.title || ""}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900 transition-colors duration-300" required />
    </div>
    <div class="md:col-span-2">
      <label class="block text-xs font-bold text-gray-600 mb-1">Target</label>
      <input data-kr-field="target" data-kr-id="${id}" type="number" min="0" step="any" value="${kr?.target ?? ""}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900 transition-colors duration-300" />
    </div>
    <div class="md:col-span-2">
      <label class="block text-xs font-bold text-gray-600 mb-1">Current</label>
      <input data-kr-field="current" data-kr-id="${id}" type="number" min="0" step="any" value="${kr?.current ?? ""}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900 transition-colors duration-300" />
    </div>
    <div class="md:col-span-2 flex justify-end">
      <button type="button" class="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors" data-remove-kr="true">
        <i class="lucide-trash-2 text-xs"></i> Xóa
      </button>
    </div>
  `;

  row.querySelector('[data-remove-kr="true"]').onclick = () => row.remove();

  krList.appendChild(row);
  applyDarkMode();
}

function handleOkrSubmit(e) {
  e.preventDefault();
  const okrId = document.getElementById("okr-id").value;
  const title = document.getElementById("okr-title").value.trim();
  const description = document.getElementById("okr-description").value.trim();
  if (!title) return;

  const rows = Array.from(krList.querySelectorAll('[data-kr-row="true"]'));
  const krs = rows
    .map((row) => {
      const titleEl = row.querySelector('[data-kr-field="title"]');
      const targetEl = row.querySelector('[data-kr-field="target"]');
      const currentEl = row.querySelector('[data-kr-field="current"]');
      const id = titleEl.dataset.krId;
      return {
        id,
        title: titleEl.value.trim(),
        target: targetEl.value === "" ? 0 : Number(targetEl.value),
        current: currentEl.value === "" ? 0 : Number(currentEl.value),
      };
    })
    .filter((kr) => kr.title);

  if (okrId) {
    const okr = state.okrs.find((o) => o.id === okrId);
    if (okr) {
      okr.title = title;
      okr.description = description;
      okr.krs = krs;
      okr.updatedAt = new Date().toISOString();
    }
  } else {
    state.okrs.push({
      id: Date.now().toString(),
      title,
      description,
      krs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  saveState();
  renderOKRs();
  closeOkrModal();
}

window.editOkr = (okrId) => openOkrModal(okrId);
window.deleteOkr = (okrId) => {
  if (confirm("Bạn có chắc chắn muốn xóa OKR này?")) {
    state.okrs = state.okrs.filter((o) => o.id !== okrId);
    saveState();
    renderOKRs();
  }
};

// Render Tasks
function renderTasks() {
  ensureTaskOrder();
  const cols = {
    todo: document.getElementById("col-todo"),
    progress: document.getElementById("col-progress"),
    review: document.getElementById("col-review"),
    done: document.getElementById("col-done"),
  };

  const counts = {
    todo: document.getElementById("count-todo"),
    progress: document.getElementById("count-progress"),
    review: document.getElementById("count-review"),
    done: document.getElementById("count-done"),
    total: document.getElementById("stat-total"),
    statProgress: document.getElementById("stat-progress"),
    statReview: document.getElementById("stat-review"),
    statDone: document.getElementById("stat-done"),
  };

  // Clear columns
  Object.values(cols).forEach((col) => (col.innerHTML = ""));

  let statusCounts = { todo: 0, progress: 0, review: 0, done: 0 };

  const statusOrder = { todo: 0, progress: 1, review: 2, done: 3 };
  const keyword = (taskView.keyword || "").trim().toLowerCase();
  const tasksFiltered = state.tasks.filter((t) => {
    if (keyword && !(t.title || "").toLowerCase().includes(keyword))
      return false;
    if (
      taskView.filters.priority !== "all" &&
      t.priority !== taskView.filters.priority
    )
      return false;
    if (
      taskView.filters.progress !== "all" &&
      t.progressState !== taskView.filters.progress
    )
      return false;
    if (
      taskView.filters.complexity !== "all" &&
      t.complexity !== taskView.filters.complexity
    )
      return false;
    return true;
  });

  const compareByField = (a, b, field, dir) => {
    let delta = 0;
    if (field === "score") {
      delta = computeTaskScore(a) - computeTaskScore(b);
    } else if (field === "priority") {
      delta = (priorityRank[a.priority] ?? 1) - (priorityRank[b.priority] ?? 1);
    } else if (field === "progress") {
      delta =
        (progressRank[a.progressState] ?? 1) -
        (progressRank[b.progressState] ?? 1);
    } else if (field === "complexity") {
      delta =
        (complexityRank[a.complexity] ?? 1) -
        (complexityRank[b.complexity] ?? 1);
    } else if (field === "deadline") {
      const aTs = a.deadline
        ? new Date(a.deadline).getTime()
        : Number.POSITIVE_INFINITY;
      const bTs = b.deadline
        ? new Date(b.deadline).getTime()
        : Number.POSITIVE_INFINITY;
      delta = aTs - bTs;
    } else if (field === "title") {
      delta = String(a.title || "").localeCompare(String(b.title || ""), "vi");
    }
    if (delta === 0) return 0;
    return dir === "desc" ? -delta : delta;
  };

  const compareRank = (a, b) => {
    const specs = (taskView.sort || []).filter(
      (s) => s && s.field && s.field !== "none",
    );
    for (const s of specs) {
      const d = compareByField(a, b, s.field, s.dir);
      if (d !== 0) return d;
    }
    return (a.order ?? 0) - (b.order ?? 0);
  };

  const tasksToRender = tasksFiltered.slice().sort((a, b) => {
    const aStatus = statusOrder[a.status] ?? 999;
    const bStatus = statusOrder[b.status] ?? 999;
    if (aStatus !== bStatus) return aStatus - bStatus;
    if (taskView.sortMode === "manual") return (a.order ?? 0) - (b.order ?? 0);
    return compareRank(a, b);
  });

  tasksToRender.forEach((task) => {
    const assignee = state.members.find((m) => m.id == task.assigneeId);
    const taskEl = document.createElement("div");
    taskEl.className =
      "bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group dark:bg-gray-800 dark:border-gray-700";
    taskEl.draggable = true;
    taskEl.dataset.taskId = task.id;
    taskEl.dataset.status = task.status;

    const isOverdue =
      task.deadline &&
      new Date(task.deadline) < new Date() &&
      task.status !== "done";

    taskEl.innerHTML = `
      <div class="flex justify-between items-start mb-2">
        <span class="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getStatusColor(task.status)}">
          ${getStatusText(task.status)}
        </span>
        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onclick="event.stopPropagation(); editTask('${task.id}')" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <i class="lucide-edit text-sm text-gray-500"></i>
          </button>
          <button onclick="event.stopPropagation(); deleteTask('${task.id}')" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <i class="lucide-trash-2 text-sm text-red-500"></i>
          </button>
        </div>
      </div>
      <div class="flex flex-wrap gap-1 mb-2">
        <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200">Điểm: ${computeTaskScore(task)}</span>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded ${getPriorityBadgeClass(task.priority)}">Ưu tiên: ${getPriorityText(task.priority)}</span>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded ${getProgressBadgeClass(task.progressState)}">Tiến độ: ${getProgressText(task.progressState)}</span>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded ${getComplexityBadgeClass(task.complexity)}">Phức tạp: ${getComplexityText(task.complexity)}</span>
      </div>
      <h4 class="font-semibold text-gray-800 dark:text-white mb-1">${task.title}</h4>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">${task.description || ""}</p>
      ${
        task.deadline
          ? `
        <div class="flex items-center gap-1 mb-2 text-xs ${isOverdue ? "text-red-500 font-medium" : "text-gray-500 dark:text-gray-400"}">
          <i class="lucide-calendar"></i>
          ${formatDate(task.deadline)}
        </div>
      `
          : ""
      }
      ${
        task.status === "review"
          ? `
        <div class="mb-3 flex gap-2 flex-wrap">
          ${renderReviewButtons(task)}
        </div>
      `
          : ""
      }
      <div class="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full ${assignee?.color || "bg-gray-400"} text-white flex items-center justify-center text-[10px] font-bold">
            ${assignee?.avatar || "?"}
          </div>
          <span class="text-xs text-gray-600 dark:text-gray-300 font-medium">${assignee?.name || "Unassigned"}</span>
        </div>
      </div>
    `;

    taskEl.addEventListener("click", () => openTaskDetailModal(task.id));
    taskEl.addEventListener("dragstart", (e) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/task-id", task.id);
      taskEl.classList.add("opacity-60");
    });
    taskEl.addEventListener("dragend", () => {
      taskEl.classList.remove("opacity-60");
    });
    taskEl.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    taskEl.addEventListener("drop", (e) => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData("text/task-id");
      if (!draggedId || draggedId === task.id) return;
      moveTask(draggedId, task.status, task.id);
    });

    cols[task.status].appendChild(taskEl);
    statusCounts[task.status]++;
  });

  // Update counts
  counts.todo.textContent = statusCounts.todo;
  counts.progress.textContent = statusCounts.progress;
  counts.review.textContent = statusCounts.review;
  counts.done.textContent = statusCounts.done;
  counts.total.textContent = state.tasks.length;
  counts.statProgress.textContent = statusCounts.progress;
  counts.statReview.textContent = statusCounts.review;
  counts.statDone.textContent = statusCounts.done;

  saveState();
}

function getStatusColor(status) {
  switch (status) {
    case "todo":
      return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
    case "progress":
      return "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300";
    case "review":
      return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300";
    case "done":
      return "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
  }
}

function getStatusText(status) {
  switch (status) {
    case "todo":
      return "Cần làm";
    case "progress":
      return "Đang làm";
    case "review":
      return "Review";
    case "done":
      return "Hoàn thành";
    default:
      return status;
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function canApprove(task) {
  return state.currentUser && state.currentUser != task.assigneeId;
}

function renderReviewButtons(task) {
  if (!task.reviewedBy) {
    task.reviewedBy = [];
  }

  const approved =
    task.reviewStatus === "approved" ||
    (Array.isArray(task.reviewedBy) && task.reviewedBy.length > 0);
  const rejected = task.reviewStatus === "rejected";

  if (approved) {
    const approverId = task.reviewBy || task.reviewedBy[0];
    const approver = state.members.find((m) => m.id == approverId);
    return `
      <div class="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
        <i class="lucide-check-circle"></i>
        Đã phê duyệt bởi ${approver?.name || "someone"}
      </div>
    `;
  }

  if (rejected) {
    const rejector = state.members.find((m) => m.id == task.reviewBy);
    return `
      <div class="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
        <i class="lucide-x-circle"></i>
        Bị từ chối bởi ${rejector?.name || "someone"}
      </div>
    `;
  }

  if (canApprove(task)) {
    return `
      <button onclick="event.stopPropagation(); openReviewModal('${task.id}')" class="px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded hover:bg-indigo-700 transition-colors">
        Review
      </button>
    `;
  }

  return `
    <span class="text-xs text-gray-500">Chờ người khác review</span>
  `;
}

window.openReviewModal = (taskId) => openReviewModal(taskId);

function openReviewModal(taskId) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) return;
  if (!canApprove(task)) {
    alert("Bạn không có quyền review task này.");
    return;
  }

  document.getElementById("review-task-id").value = task.id;
  document.getElementById("review-title").value = task.title;
  document.getElementById("review-description").value = task.description || "";
  document.getElementById("review-deadline").value = task.deadline || "";
  document.getElementById("review-note").value = task.reviewNote || "";

  const reviewAssigneeSelect = document.getElementById("review-assignee");
  reviewAssigneeSelect.innerHTML = state.members
    .map((m) => `<option value="${m.id}">${m.name}</option>`)
    .join("");
  reviewAssigneeSelect.value = task.assigneeId;

  reviewModal.classList.remove("hidden");
  applyDarkMode();
}

function closeReviewModal() {
  reviewModal.classList.add("hidden");
  reviewForm.reset();
}

function submitReviewDecision(decision) {
  const taskId = document.getElementById("review-task-id").value;
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) return;

  if (!canApprove(task)) {
    alert("Bạn không có quyền review task này.");
    return;
  }

  task.title = document.getElementById("review-title").value.trim();
  task.description = document.getElementById("review-description").value;
  task.assigneeId = document.getElementById("review-assignee").value;
  task.deadline = document.getElementById("review-deadline").value;

  task.reviewStatus = decision;
  task.reviewBy = state.currentUser;
  task.reviewAt = new Date().toISOString();
  task.reviewNote = document.getElementById("review-note").value;

  if (!Array.isArray(task.reviewedBy)) task.reviewedBy = [];

  closeReviewModal();

  if (decision === "approved") {
    task.reviewedBy = [state.currentUser];
    task.progressState = "done";
    moveTask(task.id, "done");
    return;
  }

  task.reviewedBy = [];
  task.progressState = "in_progress";
  moveTask(task.id, "progress");
}

// Event Listeners
function setupEventListeners() {
  // Task Modal
  addTaskBtn.onclick = () => openTaskModal();
  closeModalBtn.onclick = () => closeTaskModal();
  taskForm.onsubmit = handleTaskSubmit;
  closeTaskDetailModalBtn.onclick = () => closeTaskDetailModal();
  taskDetailModal.addEventListener("click", (e) => {
    if (e.target === taskDetailModal) closeTaskDetailModal();
  });

  // Member Modal
  manageMembersBtn.onclick = () => openMemberModal();
  closeMemberModalBtn.onclick = () => closeMemberModal();
  memberForm.onsubmit = handleMemberSubmit;
  currentUserSelect.onchange = (e) => {
    const userId = e.target.value;
    state.currentUser = userId;
    renderTasks();
    saveState();
  };

  // Dark Mode
  darkModeBtn.onclick = () => {
    state.darkMode = !state.darkMode;
    applyDarkMode();
    saveState();
  };

  // Export/Import
  exportBtn.onclick = exportData;
  importFile.onchange = importData;

  closeFocusModeBtn.onclick = closeFocusMode;

  aiAssistantBtn.onclick = () => aiPanel.classList.remove("hidden");
  closeAiPanelBtn.onclick = () => aiPanel.classList.add("hidden");
  aiToggleBtn.onclick = () => toggleAiEnabled();
  aiTabOneThing.onclick = () => setAiMode("onething");
  aiTabWorkspace.onclick = () => setAiMode("workspace");
  aiFocusBtn.onclick = () => openFocusMode();
  aiForm.onsubmit = (e) => {
    e.preventDefault();
    handleUnifiedAiChat();
  };
  sendAiBtn.onclick = () => handleUnifiedAiChat();

  addOkrBtn.onclick = () => openOkrModal();
  closeOkrModalBtn.onclick = () => closeOkrModal();
  cancelOkrBtn.onclick = () => closeOkrModal();
  okrForm.onsubmit = handleOkrSubmit;
  addKrBtn.onclick = () => addKrRow();

  closeReviewModalBtn.onclick = () => closeReviewModal();
  approveReviewBtn.onclick = () => submitReviewDecision("approved");
  rejectReviewBtn.onclick = () => submitReviewDecision("rejected");
  reviewForm.onsubmit = (e) => e.preventDefault();

  // Close modals on outside click
  window.onclick = (e) => {
    if (e.target === taskModal) closeTaskModal();
    if (e.target === memberModal) closeMemberModal();
    if (e.target === focusModeOverlay) closeFocusMode();
    if (e.target === reviewModal) closeReviewModal();
    if (e.target === okrModal) closeOkrModal();
  };
}

function runLocalAiWriter(type, content) {
  switch (type) {
    case "optimize-title": {
      const normalized =
        content.length > 0
          ? content.charAt(0).toUpperCase() + content.slice(1)
          : content;
      return `[3Musk] ${normalized}`;
    }
    case "fix-grammar":
      return content
        .replace(/SOP/g, "Standard Operating Procedure")
        .replace(/brief/g, "Bản tóm tắt yêu cầu");
    case "summarize":
      return `Tóm tắt: ${content.substring(0, 80)}...`;
    case "rewrite-professional":
      return `Kính gửi team,\n\nTôi muốn cập nhật về task: ${content}.\n\nTrân trọng,\nMusketeer Bot`;
    default:
      return content;
  }
}

function buildAiWriterPrompt(type, content) {
  switch (type) {
    case "optimize-title":
      return `Tối ưu tiêu đề task.\nYêu cầu: ngắn gọn, rõ ràng, tiếng Việt, <= 60 ký tự.\nChỉ trả về 1 dòng tiêu đề.\n\nNội dung:\n${content}`;
    case "fix-grammar":
      return `Sửa lỗi chính tả/ngữ pháp tiếng Việt.\nGiữ nguyên ý nghĩa, không thêm ý mới.\n\nNội dung:\n${content}`;
    case "summarize":
      return `Tóm tắt nội dung tiếng Việt thành 2-3 câu.\nGiữ đúng thông tin quan trọng.\n\nNội dung:\n${content}`;
    case "rewrite-professional":
      return `Viết lại nội dung tiếng Việt theo văn phong chuyên nghiệp, rõ ràng, dùng bullet nếu cần.\nKhông thêm thông tin không có trong input.\n\nNội dung:\n${content}`;
    default:
      return content;
  }
}

window.aiAction = async (type) => {
  const titleInput = document.getElementById("task-title");
  const descInput = document.getElementById("task-desc");

  const content =
    type === "optimize-title" ? titleInput.value : descInput.value;
  if (!content) return alert("Vui lòng nhập nội dung trước khi dùng AI!");

  if (type === "optimize-title") titleInput.value = "AI đang xử lý...";
  else descInput.value = "AI đang xử lý nội dung...";

  if (!state.aiEnabled) {
    const out = runLocalAiWriter(type, content);
    setTimeout(() => {
      if (type === "optimize-title") titleInput.value = out;
      else descInput.value = out;
    }, 200);
    return;
  }

  try {
    const text = await callGemini({
      cacheKey: `writer:${type}:${content}`,
      prompt: buildAiWriterPrompt(type, content),
    });
    const out = (text || "").trim() || runLocalAiWriter(type, content);
    if (type === "optimize-title") titleInput.value = out.split("\n")[0];
    else descInput.value = out;
  } catch (e) {
    geminiAvailable = false;
    state.aiEnabled = false;
    saveState();
    renderAiToggle();
    const out = runLocalAiWriter(type, content);
    if (type === "optimize-title") titleInput.value = out;
    else descInput.value = out;
  }
};

let aiMode = "onething";
let aiHasWelcomed = false;
let geminiAvailable = true;
let geminiAbortController = null;
const geminiCache = new Map();

function initAiAssistant() {
  aiPanel.classList.add("hidden");
  setAiMode(aiMode);
  renderAiToggle();
  if (!aiHasWelcomed) {
    appendAiMessage(
      "ai",
      `Chào bạn! Mình là AI Assistant của 3Musk.\n\nMình có thể hỗ trợ bạn phân tích REQUIREMENTS.md như:\n- Tóm tắt requirements\n- Liệt kê BR (Business Rules)\n- Liệt kê FR (Functional Requirements)\n- Giải thích Epic 6\n- Team assignment\n\nNgoài ra mình có thể trả task theo từng người (vd: “Tuấn đang có task gì”), nhóm theo deadline/status, và đưa ra One Thing cho hôm nay.\n\nBạn muốn mình hỗ trợ phần nào trước?`,
    );
    aiHasWelcomed = true;
  }
}

function renderAiToggle() {
  if (!aiToggleBtn) return;
  aiToggleBtn.textContent = state.aiEnabled ? "Gemini: BẬT" : "Gemini: TẮT";
  if (state.aiEnabled) {
    aiToggleBtn.classList.add("bg-green-100", "text-green-700");
    aiToggleBtn.classList.remove(
      "bg-purple-100",
      "text-purple-700",
      "bg-red-100",
      "text-red-700",
    );
  } else {
    aiToggleBtn.classList.add("bg-red-100", "text-red-700");
    aiToggleBtn.classList.remove(
      "bg-purple-100",
      "text-purple-700",
      "bg-green-100",
      "text-green-700",
    );
  }
}

function toggleAiEnabled() {
  state.aiEnabled = !state.aiEnabled;
  saveState();
  renderAiToggle();
  appendAiMessage(
    "ai",
    state.aiEnabled
      ? "Đã bật Gemini AI. (Nếu không có API server, hệ thống sẽ tự fallback.)"
      : "Đã tắt Gemini AI. Hệ thống dùng chế độ rule-based như cũ.",
  );
}

function setAiMode(mode) {
  aiMode = mode;
  if (aiMode === "onething") {
    aiTabOneThing.classList.add("bg-purple-600", "text-white");
    aiTabOneThing.classList.remove("text-purple-700", "dark:text-purple-200");
    aiTabWorkspace.classList.remove("bg-purple-600", "text-white");
    aiTabWorkspace.classList.add("text-purple-700", "dark:text-purple-200");
    aiInput.placeholder = "Hỏi 'hôm nay làm gì?'...";
    aiFocusBtn.classList.remove("hidden");
  } else {
    aiTabWorkspace.classList.add("bg-purple-600", "text-white");
    aiTabWorkspace.classList.remove("text-purple-700", "dark:text-purple-200");
    aiTabOneThing.classList.remove("bg-purple-600", "text-white");
    aiTabOneThing.classList.add("text-purple-700", "dark:text-purple-200");
    aiInput.placeholder = "Hỏi về workspace/OKR...";
    aiFocusBtn.classList.add("hidden");
  }
}

function appendAiMessage(role, text) {
  const wrapper = document.createElement("div");
  wrapper.className = `flex ${role === "user" ? "justify-end" : "justify-start"}`;

  const bubble = document.createElement("div");
  bubble.className =
    role === "user"
      ? "max-w-[85%] bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-3 rounded-2xl rounded-br-sm text-sm whitespace-pre-wrap shadow-sm"
      : "max-w-[85%] bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-3 rounded-2xl rounded-bl-sm text-sm whitespace-pre-wrap shadow-sm border border-purple-100 dark:border-gray-700";
  bubble.textContent = text;

  wrapper.appendChild(bubble);
  aiMessages.appendChild(wrapper);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

function shouldCallGemini(localResponse) {
  if (!geminiAvailable) return false;
  if (!state.aiEnabled) return false;
  if (typeof localResponse !== "string") return true;
  const trimmed = localResponse.trim();
  if (!trimmed) return true;
  return (
    trimmed.startsWith("Xin lỗi, tôi không hiểu") ||
    trimmed.startsWith("Bạn có thể hỏi:")
  );
}

function buildAiContext() {
  const user = state.members.find((m) => m.id == state.currentUser);
  const counts = computeStatusCounts();
  const myTasks = getCurrentUserTasks()
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 8)
    .map((t) => ({
      title: t.title,
      status: t.status,
      deadline: t.deadline || "",
    }));
  const okrTop = (state.okrs || []).slice(0, 3).map((o) => ({
    title: o.title,
    progress: Math.round(computeOkrProgress(o) * 100),
  }));
  return JSON.stringify(
    {
      currentUser: user ? { id: user.id, name: user.name } : null,
      taskCounts: counts,
      myTopTasks: myTasks,
      okrTop,
    },
    null,
    0,
  );
}

async function callGemini({ prompt, cacheKey }) {
  if (!geminiAvailable) throw new Error("gemini_unavailable");
  if (!state.aiEnabled) throw new Error("ai_disabled");

  if (cacheKey && geminiCache.has(cacheKey)) {
    return geminiCache.get(cacheKey);
  }

  if (geminiAbortController) {
    geminiAbortController.abort();
  }
  geminiAbortController = new AbortController();

  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gemini-1.5-flash",
      prompt,
      temperature: 0.2,
      max_output_tokens: 512,
    }),
    signal: geminiAbortController.signal,
  });

  if (!res.ok) {
    throw new Error(`gemini_http_${res.status}`);
  }

  const data = await res.json();
  const text = (data && data.text) || "";
  if (cacheKey) {
    geminiCache.set(cacheKey, text);
  }
  return text;
}

function handleUnifiedAiChat() {
  const query = aiInput.value.trim();
  if (!query) return;

  appendAiMessage("user", query);
  aiInput.value = "";

  setTimeout(async () => {
    const localResponse =
      aiMode === "onething"
        ? processOneThingQuery(query)
        : processWorkspaceQuery(query);

    if (!shouldCallGemini(localResponse)) {
      appendAiMessage("ai", localResponse);
      return;
    }

    try {
      const ctx = buildAiContext();
      const text = await callGemini({
        cacheKey: `${aiMode}:${query}:${ctx}`,
        prompt: `Bạn là trợ lý AI cho dashboard task và OKR.\nTrả lời ngắn gọn, đúng ngữ cảnh, tiếng Việt.\n\nNgữ cảnh (JSON): ${ctx}\n\nChế độ: ${aiMode}\nCâu hỏi: ${query}`,
      });
      appendAiMessage("ai", text || localResponse);
    } catch (e) {
      geminiAvailable = false;
      state.aiEnabled = false;
      saveState();
      renderAiToggle();
      appendAiMessage("ai", localResponse);
    }
  }, 200);
}

function computeStatusCounts() {
  const counts = { todo: 0, progress: 0, review: 0, done: 0 };
  state.tasks.forEach((t) => {
    if (counts[t.status] !== undefined) counts[t.status]++;
  });
  return { total: state.tasks.length, ...counts };
}

function processWorkspaceQuery(query) {
  const lower = query.toLowerCase();
  const q = normalizeForNlp(query ?? "");
  const counts = computeStatusCounts();

  if (q.includes("roi") || q.includes("tiet kiem") || q.includes("impact")) {
    const active = counts.todo + counts.progress + counts.review;
    const estSavedMinPerDay = Math.min(45, 6 + active * 2);
    return `Business Impact (ước tính demo):\n- Active tasks: ${active}\n- Giảm thời gian hỏi/đồng bộ (standup/status): ~${estSavedMinPerDay} phút/ngày/người\n- Giảm lỗi quy trình: BR-03 (review trước Done) giúp giảm “done ảo”\n\nGợi ý: hỏi “tổng quan/status”, “task quá hạn”, hoặc “Tuấn đang có task gì” để xem luồng.`;
  }

  if (lower.includes("okr")) {
    if (!state.okrs || state.okrs.length === 0) {
      return "Hiện chưa có OKR nào. Bạn có thể bấm “Thêm OKR” để tạo Objective và Key Results.";
    }
    const top = state.okrs.slice(0, 3).map((o, idx) => {
      const progress = Math.round(computeOkrProgress(o) * 100);
      return `${idx + 1}. ${o.title} (${progress}%)`;
    });
    return `OKR hiện có ${state.okrs.length} objective.\n${top.join("\n")}`;
  }

  if (lower.includes("tổng quan") || lower.includes("status")) {
    return `Workspace có ${counts.total} task.\n- Todo: ${counts.todo}\n- Progress: ${counts.progress}\n- Review: ${counts.review}\n- Done: ${counts.done}`;
  }

  if (lower.includes("task của tôi") || lower.includes("my tasks")) {
    const myTasks = getCurrentUserTasks();
    if (myTasks.length === 0) return "Bạn không có task nào chưa hoàn thành.";
    return `Task của bạn (${myTasks.length}):\n${myTasks
      .map(
        (t, idx) =>
          `${idx + 1}. ${t.title} [${getStatusText(t.status)}]${
            t.deadline ? ` - ${formatDate(t.deadline)}` : ""
          }`,
      )
      .join("\n")}`;
  }

  const member = findMemberByQuery(q);
  const hasTaskWord = q.includes("task") || q.includes("cong viec");
  if (member && hasTaskWord) {
    const includeDone = q.includes("tat ca") || q.includes("all");
    const base = state.tasks.filter((t) => t.assigneeId == member.id);
    const tasks = includeDone ? base : base.filter((t) => t.status !== "done");
    const keywords = extractKeywordFilter(q);
    const filtered = filterTasksByKeywords(tasks, keywords);
    if (filtered.length === 0) {
      return `Hiện không có task phù hợp cho ${member.name}.\nGợi ý: thử “tất cả task của ${member.name}” hoặc thêm từ khoá.`;
    }
    return buildStructuredTasksOutput({
      header: `Tasks for ${member.name}`,
      member,
      tasks: filtered,
      groupMode:
        q.includes("deadline") || q.includes("han") ? "deadline" : "status",
    });
  }

  if (q.includes("qua han") || q.includes("overdue")) {
    const overdueTasks = state.tasks.filter(
      (t) =>
        t.deadline && new Date(t.deadline) < new Date() && t.status !== "done",
    );
    if (overdueTasks.length === 0) return "Hiện không có task quá hạn.";
    return buildStructuredTasksOutput({
      header: "Overdue Tasks",
      member: null,
      tasks: overdueTasks,
      groupMode: "status",
    });
  }

  if (
    q.includes("requirements") ||
    q.includes("br") ||
    q.includes("fr") ||
    q.includes("epic") ||
    q.includes("team") ||
    q.includes("phan cong") ||
    q.includes("assignment")
  ) {
    return answerRequirementsQuery(query);
  }

  if (q.includes("khong thay") || q.includes("khong hieu")) {
    return "Mình có thể hỗ trợ: “tổng quan/status”, “OKR”, “task của tôi”, hoặc “<tên> đang có task gì”. Bạn muốn xem phần nào?";
  }

  return "Bạn có thể hỏi: “tổng quan/status”, “OKR”, “task của tôi?”, hoặc “Tuấn đang có task gì”.";
}

function getCurrentUserTasks() {
  return state.tasks.filter(
    (t) => t.assigneeId == state.currentUser && t.status !== "done",
  );
}

function getOneThingPriority() {
  const userTasks = getCurrentUserTasks();
  if (userTasks.length === 0) return null;

  // Sort by deadline (earliest first), then by status (progress > review > todo)
  const statusOrder = { progress: 0, review: 1, todo: 2 };
  return userTasks.sort((a, b) => {
    // First compare deadlines
    if (a.deadline && b.deadline) {
      return new Date(a.deadline) - new Date(b.deadline);
    }
    if (a.deadline) return -1;
    if (b.deadline) return 1;

    // Then compare status
    return statusOrder[a.status] - statusOrder[b.status];
  })[0];
}

function removeDiacritics(value) {
  return (value ?? "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeForNlp(value) {
  const cleaned = removeDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned;
}

function findMemberByQuery(queryNlp) {
  if (!queryNlp) return null;
  const direct = state.members.find((m) =>
    queryNlp.includes(normalizeForNlp(m.name)),
  );
  if (direct) return direct;

  const tokens = queryNlp.split(" ").filter(Boolean);
  for (const m of state.members) {
    const nameTokens = normalizeForNlp(m.name).split(" ").filter(Boolean);
    if (nameTokens.length === 0) continue;
    const hitCount = nameTokens.filter((t) => tokens.includes(t)).length;
    if (hitCount >= Math.min(2, nameTokens.length)) return m;
  }
  return null;
}

function getStatusRank(status) {
  const statusOrder = { progress: 0, review: 1, todo: 2, done: 3 };
  return statusOrder[status] ?? 99;
}

function scoreTaskForPriority(task) {
  const now = new Date();
  const deadline = task.deadline ? new Date(task.deadline) : null;
  const overdue = deadline && deadline < now && task.status !== "done";
  const deadlineScore = deadline
    ? Math.max(0, (deadline - now) / 86400000)
    : 999;
  const statusScore = getStatusRank(task.status);
  return (overdue ? -1000 : 0) + deadlineScore * 10 + statusScore;
}

function buildTaskSummary(tasks) {
  const counts = { todo: 0, progress: 0, review: 0, done: 0 };
  tasks.forEach((t) => {
    counts[t.status] = (counts[t.status] ?? 0) + 1;
  });
  const active = tasks.filter((t) => t.status !== "done").length;
  const overdue = tasks.filter(
    (t) =>
      t.deadline && new Date(t.deadline) < new Date() && t.status !== "done",
  ).length;
  return { counts, active, overdue, total: tasks.length };
}

function getReviewText(task) {
  if (task.status !== "review" && task.status !== "done") return "";
  const approvers = Array.isArray(task.reviewedBy) ? task.reviewedBy : [];
  if (approvers.length === 0) return "Review: pending";
  const names = approvers
    .map((id) => state.members.find((m) => m.id == id)?.name)
    .filter(Boolean);
  return `Review: approved by ${names.length ? names.join(", ") : "member"}`;
}

function formatTaskLine(task) {
  const parts = [];
  parts.push(task.title || "(no title)");
  parts.push(`[${getStatusText(task.status)}]`);
  if (task.deadline) parts.push(`due ${formatDate(task.deadline)}`);
  const review = getReviewText(task);
  if (review) parts.push(`(${review})`);
  return parts.join(" ");
}

function groupTasks(tasks, mode) {
  const groups = new Map();
  const put = (key, item) => {
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  };

  if (mode === "deadline") {
    tasks.forEach((t) => put(t.deadline ? t.deadline : "no-deadline", t));
    return [...groups.entries()].sort((a, b) => {
      if (a[0] === "no-deadline") return 1;
      if (b[0] === "no-deadline") return -1;
      return new Date(a[0]) - new Date(b[0]);
    });
  }

  tasks.forEach((t) => put(t.status, t));
  const order = ["progress", "review", "todo", "done"];
  return [...groups.entries()].sort(
    (a, b) => order.indexOf(a[0]) - order.indexOf(b[0]),
  );
}

function extractKeywordFilter(queryNlp) {
  const stop = new Set([
    "task",
    "tasks",
    "cong",
    "viec",
    "cua",
    "toi",
    "minh",
    "hien",
    "tai",
    "dang",
    "co",
    "gi",
    "nao",
    "nhung",
    "mot",
    "so",
    "hay",
    "cho",
    "xem",
    "ve",
    "lien",
    "quan",
    "hom",
    "nay",
    "mai",
    "tuan",
    "thang",
    "nam",
  ]);
  const tokens = queryNlp
    .split(" ")
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => !stop.has(t) && t.length >= 2);
  return tokens.length ? tokens.slice(0, 4) : [];
}

function filterTasksByKeywords(tasks, keywords) {
  if (!keywords || keywords.length === 0) return tasks;
  return tasks.filter((t) => {
    const hay = normalizeForNlp(`${t.title ?? ""} ${t.description ?? ""}`);
    return keywords.every((k) => hay.includes(k));
  });
}

function buildStructuredTasksOutput({ header, member, tasks, groupMode }) {
  const summary = buildTaskSummary(tasks);
  const oneThing = tasks
    .filter((t) => t.status !== "done")
    .slice()
    .sort((a, b) => scoreTaskForPriority(a) - scoreTaskForPriority(b))[0];

  const lines = [];
  if (header) lines.push(header);
  lines.push(`Context: ${member ? member.name : "Team/Workspace"}`);
  lines.push(
    `Summary: total=${summary.total}, active=${summary.active}, overdue=${summary.overdue}`,
  );
  lines.push(
    `By status: todo=${summary.counts.todo}, progress=${summary.counts.progress}, review=${summary.counts.review}, done=${summary.counts.done}`,
  );
  if (oneThing) lines.push(`One Thing: ${formatTaskLine(oneThing)}`);
  lines.push("");

  const grouped = groupTasks(tasks, groupMode);
  grouped.forEach(([key, list]) => {
    const title =
      groupMode === "deadline"
        ? key === "no-deadline"
          ? "No deadline"
          : `Due ${formatDate(key)}`
        : getStatusText(key);
    const sorted = list
      .slice()
      .sort((a, b) => scoreTaskForPriority(a) - scoreTaskForPriority(b));
    lines.push(`${title} (${sorted.length})`);
    sorted.forEach((t, idx) => {
      const detail = t.description ? ` — ${clampText(t.description, 90)}` : "";
      lines.push(`- ${idx + 1}. ${formatTaskLine(t)}${detail}`);
    });
    lines.push("");
  });

  return lines.join("\n").trim();
}

function processOneThingQuery(query) {
  const raw = query ?? "";
  const q = normalizeForNlp(raw);

  if (
    q.includes("requirements") ||
    q.includes("br") ||
    q.includes("fr") ||
    q.includes("epic") ||
    q.includes("team") ||
    q.includes("phan cong") ||
    q.includes("assignment")
  ) {
    return answerRequirementsQuery(raw);
  }

  if (q.includes("hom nay") || q.includes("today") || q.includes("one thing")) {
    const oneThing = getOneThingPriority();
    if (!oneThing) {
      return "Chúc mừng! Bạn không còn task nào chưa hoàn thành! 🎉";
    }
    const assignee = state.members.find((m) => m.id == oneThing.assigneeId);
    return `✨ **One Thing Today** ✨

**${oneThing.title}**
${oneThing.description ? `- ${oneThing.description}` : ""}
- Người thực hiện: ${assignee?.name || "Unassigned"}
${oneThing.deadline ? `- Hạn nộp: ${formatDate(oneThing.deadline)}` : ""}
- Trạng thái: ${getStatusText(oneThing.status)}`;
  }

  if (q.includes("task cua toi") || q.includes("my tasks")) {
    const myTasks = getCurrentUserTasks();
    if (myTasks.length === 0) {
      return "Bạn không có task nào! 🎉";
    }
    const member = state.members.find((m) => m.id == state.currentUser) ?? null;
    return buildStructuredTasksOutput({
      header: "Your Tasks",
      member,
      tasks: myTasks.slice(),
      groupMode:
        q.includes("deadline") || q.includes("han") ? "deadline" : "status",
    });
  }

  if (
    q.includes("team") ||
    q.includes("nhom") ||
    q.includes("team ra sao") ||
    q.includes("tong quan")
  ) {
    return buildStructuredTasksOutput({
      header: "Team Overview",
      member: null,
      tasks: state.tasks.slice(),
      groupMode:
        q.includes("deadline") || q.includes("han") ? "deadline" : "status",
    });
  }

  const member = findMemberByQuery(q);
  const hasTaskWord = q.includes("task") || q.includes("cong viec");
  if (
    member &&
    (hasTaskWord ||
      q.includes("dang co") ||
      q.includes("hien tai") ||
      q.includes("hien"))
  ) {
    const includeDone = q.includes("tat ca") || q.includes("all");
    const base = state.tasks.filter((t) => t.assigneeId == member.id);
    const activeOnly = includeDone
      ? base
      : base.filter((t) => t.status !== "done");
    const keywords = extractKeywordFilter(q);
    const filtered = filterTasksByKeywords(activeOnly, keywords);
    if (filtered.length === 0) {
      const hint =
        keywords.length > 0
          ? `Không tìm thấy task của ${member.name} khớp từ khoá: ${keywords.join(", ")}.`
          : `Hiện không có task nào cho ${member.name}.`;
      return `${hint}\nGợi ý: thử 'tất cả task của ${member.name}' hoặc 'team ra sao?'.`;
    }
    return buildStructuredTasksOutput({
      header: `Tasks for ${member.name}`,
      member,
      tasks: filtered.slice(),
      groupMode:
        q.includes("deadline") || q.includes("han") ? "deadline" : "status",
    });
  }

  if (q.includes("qua han") || q.includes("overdue")) {
    const overdueTasks = state.tasks.filter(
      (t) =>
        t.deadline && new Date(t.deadline) < new Date() && t.status !== "done",
    );
    if (overdueTasks.length === 0) return "Hiện không có task quá hạn.";
    return buildStructuredTasksOutput({
      header: "Overdue Tasks",
      member: null,
      tasks: overdueTasks.slice(),
      groupMode: "status",
    });
  }

  if (
    q.includes("khong thay gi") ||
    q.includes("khong thay") ||
    q.includes("khong co gi") ||
    q.includes("khong hieu")
  ) {
    const current = state.members.find((m) => m.id == state.currentUser);
    return `Mình có thể giúp bạn theo 3 hướng:\n1) One Thing hôm nay: "hôm nay làm gì?"\n2) Task của bạn: "task của tôi"\n3) Task của người khác: "Tuấn đang có task gì"\n\nHiện user đang chọn: ${current?.name || "Unknown"}`;
  }

  const membersHint = state.members.map((m) => m.name).join(", ");
  return `Mình chưa hiểu rõ ý bạn. Bạn có thể thử:\n- "hôm nay làm gì?"\n- "task của tôi"\n- "<tên> đang có task gì" (vd: Tuấn/Thắng/Nhật)\n- "team ra sao"\n- "task quá hạn"\n\nMembers: ${membersHint}`;
}

function openFocusMode() {
  const oneThing = getOneThingPriority();
  if (!oneThing) {
    alert("Bạn không có task nào để focus!");
    return;
  }

  const assignee = state.members.find((m) => m.id == oneThing.assigneeId);
  const isOverdue =
    oneThing.deadline &&
    new Date(oneThing.deadline) < new Date() &&
    oneThing.status !== "done";

  focusModeTask.innerHTML = `
    <div class="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800">
      <div class="flex justify-between items-start mb-4">
        <span class="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getStatusColor(oneThing.status)}">
          ${getStatusText(oneThing.status)}
        </span>
      </div>
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">${oneThing.title}</h3>
      ${
        oneThing.description
          ? `<p class="text-gray-600 dark:text-gray-300 mb-4">${oneThing.description}</p>`
          : ""
      }
      <div class="flex items-center gap-2 mb-4">
        <div class="w-8 h-8 rounded-full ${assignee?.color || "bg-gray-400"} text-white flex items-center justify-center text-xs font-bold">
          ${assignee?.avatar || "?"}
        </div>
        <span class="text-sm text-gray-600 dark:text-gray-300 font-medium">${assignee?.name || "Unassigned"}</span>
      </div>
      ${
        oneThing.deadline
          ? `
        <div class="flex items-center gap-2 text-sm ${isOverdue ? "text-red-500 font-medium" : "text-gray-600 dark:text-gray-300"}">
          <i class="lucide-calendar"></i>
          ${formatDate(oneThing.deadline)}
        </div>
      `
          : ""
      }
    </div>
  `;
  focusModeOverlay.classList.remove("hidden");
}

function closeFocusMode() {
  focusModeOverlay.classList.add("hidden");
}
// ----------------------
// AI Knowledge Manager (Agent Workflow)
// ----------------------

const aiState = {
  requirementsRaw: "",
  requirements: null,
  ready: false,
};

function getAiProfiles() {
  try {
    return JSON.parse(localStorage.getItem("3musk_ai_profiles") || "{}");
  } catch {
    return {};
  }
}

function saveAiProfiles(profiles) {
  localStorage.setItem("3musk_ai_profiles", JSON.stringify(profiles || {}));
}

function getDefaultAiProfileForMember(member) {
  const nameNlp = normalizeForNlp(member?.name || "");
  if (nameNlp.includes("tuan")) {
    return { tone: "professional", verbosity: "normal", showTrace: false };
  }
  if (nameNlp.includes("thang")) {
    return { tone: "professional", verbosity: "detailed", showTrace: false };
  }
  if (nameNlp.includes("nhat")) {
    return { tone: "friendly", verbosity: "normal", showTrace: false };
  }
  return { tone: "friendly", verbosity: "normal", showTrace: false };
}

function getAiProfileForCurrentUser() {
  const current = state.members.find((m) => m.id == state.currentUser);
  const profiles = getAiProfiles();
  const saved = profiles[String(current?.id ?? "")];
  const base = getDefaultAiProfileForMember(current);
  return { ...base, ...(saved || {}), memberId: current?.id ?? null };
}

function setAiProfileForCurrentUser(next) {
  const current = state.members.find((m) => m.id == state.currentUser);
  if (!current) return;
  const profiles = getAiProfiles();
  profiles[String(current.id)] = {
    ...(profiles[String(current.id)] || {}),
    ...next,
  };
  saveAiProfiles(profiles);
}

function getTonePhrases(profile) {
  const tone = profile?.tone || "friendly";
  if (tone === "professional") {
    return {
      assistant: "Tôi",
      suggest: "Gợi ý",
      ask: "Bạn muốn tôi hỗ trợ thêm gì?",
      ok: "Đã cập nhật.",
    };
  }
  return {
    assistant: "Mình",
    suggest: "Gợi ý",
    ask: "Bạn muốn mình hỗ trợ thêm gì?",
    ok: "Ok, mình đã cập nhật nha.",
  };
}

async function initAiKnowledgeManager() {
  if (!aiChatHistory || !aiInput || !sendAiQueryBtn || !aiPanel) return;

  if (aiChatHistory.children.length === 0) {
    const profile = getAiProfileForCurrentUser();
    const t = getTonePhrases(profile);
    addAiMessage({
      role: "assistant",
      text: `Chào bạn! ${t.assistant} là AI Assistant của 3Musk.\n\n${t.assistant} có thể giúp bạn phân tích REQUIREMENTS.md như:\n- Tóm tắt requirements\n- Liệt kê BR (Business Rules)\n- Liệt kê FR (Functional Requirements)\n- Giải thích Epic 6\n- Team assignment\n\nNgoài ra ${t.assistant.toLowerCase()} cũng có thể trả task theo từng người (vd: "Tuấn đang có task gì").\n\n${t.ask}`,
    });
  }

  try {
    const raw = await fetch("./REQUIREMENTS.md", { cache: "no-store" }).then(
      (r) => {
        if (!r.ok) throw new Error("Không load được REQUIREMENTS.md");
        return r.text();
      },
    );
    aiState.requirementsRaw = raw;
    aiState.requirements = parseRequirementsMarkdown(raw);
    aiState.ready = true;
  } catch (err) {
    aiState.ready = false;
    addAiMessage({
      role: "assistant",
      text: `Không thể load REQUIREMENTS.md trong browser. Lý do: ${err?.message || "unknown"}.`,
    });
  }
}

function toggleAiPanel() {
  if (!aiPanel) return;
  aiPanel.classList.toggle("translate-x-full");
  if (!aiPanel.classList.contains("translate-x-full")) {
    aiInput?.focus();
  }
}

function closeAiPanel() {
  if (!aiPanel) return;
  aiPanel.classList.add("translate-x-full");
}

function addAiMessage({ role, text }) {
  if (!aiChatHistory) return;
  const safeText = escapeHtml(text);
  const wrapper = document.createElement("div");
  wrapper.className = `flex ${role === "user" ? "justify-end" : "justify-start"}`;
  wrapper.innerHTML = `
    <div class="${
      role === "user"
        ? "bg-purple-600 text-white"
        : "bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
    } max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm border border-purple-100 dark:border-gray-700 whitespace-pre-wrap">${safeText}</div>
  `;
  aiChatHistory.appendChild(wrapper);
  aiChatHistory.scrollTop = aiChatHistory.scrollHeight;
}

function handleAiSubmit() {
  const q = aiInput?.value?.trim();
  if (!q) return;
  addAiMessage({ role: "user", text: q });
  aiInput.value = "";

  const response = runAiWorkflow(q);
  addAiMessage({ role: "assistant", text: response });
}

function runAiWorkflow(query) {
  const input = normalizeText(query);
  const inputNlp = normalizeForNlp(input);
  const profile = getAiProfileForCurrentUser();

  const plan = inferAiPlan({ input, inputNlp, profile });
  const output = executeAiPlan(plan);

  if (profile.showTrace) {
    return `Input:\n- ${input}\n\nProcessing:\n${plan.processing}\n\nOutput:\n${output}`;
  }
  return output;
}

function inferAiPlan({ input, inputNlp, profile }) {
  const candidates = [];

  const push = (type, score, payload = {}) => {
    candidates.push({ type, score, ...payload });
  };

  const q = inputNlp;
  const member = findMemberByQuery(q);
  const hasTaskWord = q.includes("task") || q.includes("cong viec");
  const groupByDeadline =
    q.includes("deadline") || q.includes("han") || q.includes("ngay");
  const includeDone = q.includes("tat ca") || q.includes("all");

  if (
    q.includes("phong cach") ||
    q.includes("gio ng") ||
    q.includes("giọng") ||
    q.includes("tone") ||
    q.includes("verbosity") ||
    q.includes("chi tiet") ||
    q.includes("ngan gon") ||
    q.includes("bat trace") ||
    q.includes("tat trace")
  ) {
    push("set_profile", 90);
  }

  if (
    q.includes("seed demo") ||
    q.includes("setup demo") ||
    q.includes("tao du lieu gia") ||
    q.includes("tạo dữ liệu giả")
  ) {
    push("seed_demo", 95);
  }

  if (
    q.includes("reset demo") ||
    q.includes("xoa du lieu") ||
    q.includes("clear data")
  ) {
    push("reset_demo", 95);
  }

  if (q.includes("self test") || q.includes("kiem thu")) {
    push("self_test_requirements", 92);
  }

  if (q.startsWith("tao task") || q.startsWith("tạo task")) {
    const title = input.split(":").slice(1).join(":").trim();
    push("create_task", 90, { title });
  }

  if (
    q.includes("tom tat requirements") ||
    q.includes("requirements md") ||
    q.includes("requirements la gi") ||
    q.includes("requirements.md")
  ) {
    push("requirements_summary", 80);
  }

  if (q.includes("business objective") || q.includes("muc tieu")) {
    push("business_objective", 70);
  }

  if (
    q.includes("business rule") ||
    q.includes("quy tac") ||
    q.includes("br-") ||
    q === "br"
  ) {
    push("business_rules", 70);
  }

  if (q.includes("functional requirement") || q.includes("fr-") || q === "fr") {
    push("functional_requirements", 70);
  }

  if (q.includes("epic")) {
    const match = q.match(/epic\s*(\d+)/);
    push("epic", 70, { epicId: match ? match[1] : null });
  }

  if (
    q.includes("team") ||
    q.includes("phan cong") ||
    q.includes("assignment")
  ) {
    push("team_assignment", 65);
  }

  if (
    q.includes("workspace") ||
    q.includes("tinh hinh") ||
    q.includes("tong quan")
  ) {
    push("workspace_overview", 60);
  }

  if (q.includes("one thing") || q.includes("hom nay") || q.includes("today")) {
    push("one_thing_today", 60);
  }

  if (q.includes("qua han") || q.includes("overdue")) {
    push("overdue_tasks", 75, {
      groupMode: groupByDeadline ? "deadline" : "status",
    });
  }

  if (q.includes("task cua toi") || q.includes("my tasks")) {
    push("my_tasks", 80, {
      groupMode: groupByDeadline ? "deadline" : "status",
      includeDone,
    });
  }

  if (
    member &&
    (hasTaskWord ||
      q.includes("dang co") ||
      q.includes("hien tai") ||
      q.includes("co task"))
  ) {
    push("tasks_by_person", 85, {
      memberId: member.id,
      memberName: member.name,
      groupMode: groupByDeadline ? "deadline" : "status",
      includeDone,
      keywords: extractKeywordFilter(q),
    });
  }

  if (
    q.includes("khong thay gi") ||
    q.includes("khong thay") ||
    q.includes("khong hieu") ||
    q.includes("khong co gi")
  ) {
    push("clarify", 55);
  }

  push("help", 10);

  const best = candidates.slice().sort((a, b) => b.score - a.score)[0];
  const processing = buildAiProcessing({
    input,
    inputNlp,
    best,
    candidates,
    profile,
  });
  return { intent: best, processing, candidates, input, inputNlp };
}

function buildAiProcessing({ input, inputNlp, best, candidates, profile }) {
  const steps = [];
  steps.push(`- Normalize: ok`);
  steps.push(`- Detect intent: ${best.type} (score=${best.score})`);
  const top = candidates
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((c) => `${c.type}:${c.score}`)
    .join(", ");
  steps.push(`- Candidates: ${top}`);
  steps.push(
    `- Profile: tone=${profile.tone}, verbosity=${profile.verbosity}, trace=${profile.showTrace ? "on" : "off"}`,
  );
  steps.push(`- REQUIREMENTS.md: ${aiState.ready ? "ready" : "not-ready"}`);
  if (
    best.type === "tasks_by_person" ||
    best.type === "my_tasks" ||
    best.type === "overdue_tasks" ||
    best.type === "workspace_overview"
  ) {
    steps.push("- Read state: members/tasks");
    steps.push("- Sort/group/filter tasks");
  }
  if (
    best.type === "create_task" ||
    best.type === "seed_demo" ||
    best.type === "reset_demo"
  ) {
    steps.push("- Execute action + persist");
  }
  if (
    best.type === "requirements_summary" ||
    best.type === "business_objective" ||
    best.type === "business_rules" ||
    best.type === "functional_requirements" ||
    best.type === "epic" ||
    best.type === "team_assignment"
  ) {
    steps.push("- Retrieve knowledge from parsed markdown");
  }
  return steps.join("\n");
}

function parseProfileCommand(inputNlp) {
  const next = {};
  if (
    inputNlp.includes("professional") ||
    inputNlp.includes("chuyen nghiep") ||
    inputNlp.includes("nghiem tuc")
  ) {
    next.tone = "professional";
  }
  if (
    inputNlp.includes("friendly") ||
    inputNlp.includes("than thien") ||
    inputNlp.includes("thoai mai")
  ) {
    next.tone = "friendly";
  }
  if (inputNlp.includes("ngan gon") || inputNlp.includes("short")) {
    next.verbosity = "short";
  }
  if (inputNlp.includes("chi tiet") || inputNlp.includes("detailed")) {
    next.verbosity = "detailed";
  }
  if (inputNlp.includes("binh thuong") || inputNlp.includes("normal")) {
    next.verbosity = "normal";
  }
  if (inputNlp.includes("bat trace") || inputNlp.includes("show trace")) {
    next.showTrace = true;
  }
  if (inputNlp.includes("tat trace") || inputNlp.includes("hide trace")) {
    next.showTrace = false;
  }
  return next;
}

function formatTasksWithProfile({ header, member, tasks, groupMode, profile }) {
  const t = getTonePhrases(profile);
  if (!tasks || tasks.length === 0) {
    const who = member ? member.name : "hiện tại";
    return `${t.assistant} không thấy task nào phù hợp cho ${who}.`;
  }

  if (profile.verbosity === "short") {
    const summary = buildTaskSummary(tasks);
    const top = tasks
      .slice()
      .sort((a, b) => scoreTaskForPriority(a) - scoreTaskForPriority(b))
      .slice(0, 5);
    const lines = [];
    if (header) lines.push(header);
    lines.push(`Context: ${member ? member.name : "Team/Workspace"}`);
    lines.push(
      `Summary: total=${summary.total}, active=${summary.active}, overdue=${summary.overdue}`,
    );
    lines.push("");
    top.forEach((x, idx) => lines.push(`- ${idx + 1}. ${formatTaskLine(x)}`));
    return lines.join("\n");
  }

  const detailMaxLen = profile.verbosity === "detailed" ? 160 : 80;
  const summary = buildTaskSummary(tasks);
  const oneThing = tasks
    .filter((x) => x.status !== "done")
    .slice()
    .sort((a, b) => scoreTaskForPriority(a) - scoreTaskForPriority(b))[0];

  const lines = [];
  if (header) lines.push(header);
  lines.push(`Context: ${member ? member.name : "Team/Workspace"}`);
  lines.push(
    `Summary: total=${summary.total}, active=${summary.active}, overdue=${summary.overdue}`,
  );
  lines.push(
    `By status: todo=${summary.counts.todo}, progress=${summary.counts.progress}, review=${summary.counts.review}, done=${summary.counts.done}`,
  );
  if (oneThing) lines.push(`One Thing: ${formatTaskLine(oneThing)}`);
  lines.push("");

  const grouped = groupTasks(tasks, groupMode);
  grouped.forEach(([key, list]) => {
    const title =
      groupMode === "deadline"
        ? key === "no-deadline"
          ? "No deadline"
          : `Due ${formatDate(key)}`
        : getStatusText(key);
    const sorted = list
      .slice()
      .sort((a, b) => scoreTaskForPriority(a) - scoreTaskForPriority(b));
    lines.push(`${title} (${sorted.length})`);
    sorted.forEach((task, idx) => {
      const detail = task.description
        ? ` — ${clampText(task.description, detailMaxLen)}`
        : "";
      lines.push(`- ${idx + 1}. ${formatTaskLine(task)}${detail}`);
    });
    lines.push("");
  });

  lines.push(
    `${t.suggest}: bạn có thể hỏi "nhóm theo deadline" hoặc thêm từ khoá (vd: "UI", "deploy").`,
  );
  return lines.join("\n").trim();
}

function executeAiPlan(plan) {
  const intent = plan.intent;
  const profile = getAiProfileForCurrentUser();
  const t = getTonePhrases(profile);

  if (intent.type === "set_profile") {
    const changes = parseProfileCommand(plan.inputNlp || "");
    if (Object.keys(changes).length === 0) {
      return `${t.suggest}: "phong cách chuyên nghiệp", "ngắn gọn", "chi tiết", "bật trace", "tắt trace".`;
    }
    setAiProfileForCurrentUser(changes);
    const current = getAiProfileForCurrentUser();
    return `${t.ok}\nProfile hiện tại: tone=${current.tone}, verbosity=${current.verbosity}, trace=${current.showTrace ? "on" : "off"}`;
  }

  if (
    intent.type === "seed_demo" ||
    intent.type === "reset_demo" ||
    intent.type === "self_test_requirements" ||
    intent.type === "create_task" ||
    intent.type === "requirements_summary" ||
    intent.type === "business_objective" ||
    intent.type === "business_rules" ||
    intent.type === "functional_requirements" ||
    intent.type === "epic" ||
    intent.type === "team_assignment" ||
    intent.type === "workspace_overview" ||
    intent.type === "one_thing_today"
  ) {
    return executeAiIntent(intent);
  }

  if (intent.type === "overdue_tasks") {
    const overdueTasks = state.tasks.filter(
      (x) =>
        x.deadline && new Date(x.deadline) < new Date() && x.status !== "done",
    );
    return formatTasksWithProfile({
      header: "Overdue Tasks",
      member: null,
      tasks: overdueTasks,
      groupMode: intent.groupMode || "status",
      profile,
    });
  }

  if (intent.type === "my_tasks") {
    const member = state.members.find((m) => m.id == state.currentUser) ?? null;
    const base = state.tasks.filter((x) => x.assigneeId == state.currentUser);
    const tasks = intent.includeDone
      ? base
      : base.filter((x) => x.status !== "done");
    return formatTasksWithProfile({
      header: "Your Tasks",
      member,
      tasks,
      groupMode: intent.groupMode || "status",
      profile,
    });
  }

  if (intent.type === "tasks_by_person") {
    const member = state.members.find((m) => m.id == intent.memberId) ?? null;
    if (!member) return `${t.assistant} không tìm thấy thành viên phù hợp.`;
    const base = state.tasks.filter((x) => x.assigneeId == member.id);
    const tasks = intent.includeDone
      ? base
      : base.filter((x) => x.status !== "done");
    const filtered = filterTasksByKeywords(tasks, intent.keywords || []);
    return formatTasksWithProfile({
      header: `Tasks for ${member.name}`,
      member,
      tasks: filtered,
      groupMode: intent.groupMode || "status",
      profile,
    });
  }

  if (intent.type === "clarify") {
    const current = state.members.find((m) => m.id == state.currentUser);
    return `${t.assistant} có thể hỗ trợ theo các hướng này:\n1) Phân tích REQUIREMENTS.md: "tóm tắt requirements", "liệt kê BR", "liệt kê FR", "epic 6", "team assignment"\n2) Task: "task của tôi", "Tuấn đang có task gì", "task quá hạn", "team ra sao"\n\nHiện user đang chọn: ${current?.name || "Unknown"}\n\n${t.ask}`;
  }

  const membersHint = state.members.map((m) => m.name).join(", ");
  return `${t.suggest}: thử một trong các câu sau:\n- "tóm tắt requirements"\n- "liệt kê BR"\n- "liệt kê FR"\n- "epic 6"\n- "team assignment"\n- "task của tôi"\n- "Tuấn đang có task gì"\n- "task quá hạn"\n- "team ra sao"\n\nMembers: ${membersHint}\n\n${t.ask}`;
}
function openTaskModal(task = null) {
  const modalTitle = document.getElementById("task-modal-title");
  const submitBtn = document.getElementById("task-submit-btn");
  const taskIdInput = document.getElementById("task-id");
  const titleInput = document.getElementById("task-title");
  const descInput = document.getElementById("task-desc");
  const assigneeInput = document.getElementById("task-assignee");
  const deadlineInput = document.getElementById("task-deadline");

  if (task) {
    modalTitle.textContent = "Chỉnh sửa Task";
    submitBtn.textContent = "Lưu";
    taskIdInput.value = task.id;
    titleInput.value = task.title;
    descInput.value = task.description || "";
    assigneeInput.value = task.assigneeId;
    deadlineInput.value = task.deadline || "";
  } else {
    modalTitle.textContent = "Giao Task mới";
    submitBtn.textContent = "Tạo Task";
    taskForm.reset();
  }

  taskModal.classList.remove("hidden");
}

function closeTaskModal() {
  taskModal.classList.add("hidden");
  taskForm.reset();
}

function handleTaskSubmit(e) {
  e.preventDefault();

  const taskId = document.getElementById("task-id").value;
  const title = document.getElementById("task-title").value;
  const description = document.getElementById("task-desc").value;
  const assigneeId = document.getElementById("task-assignee").value;
  const deadline = document.getElementById("task-deadline").value;

  if (taskId) {
    // Edit existing task
    const task = state.tasks.find((t) => t.id === taskId);
    if (task) {
      task.title = title;
      task.description = description;
      task.assigneeId = assigneeId;
      task.deadline = deadline;
    }
  } else {
    // Create new task
    const newTask = {
      id: Date.now().toString(),
      title,
      description,
      assigneeId,
      deadline,
      status: "todo",
      order: getNextOrder("todo"),
      createdAt: new Date().toISOString(),
      reviewedBy: [],
    };
    state.tasks.push(newTask);
  }

  renderTasks();
  closeTaskModal();
}

function openMemberModal(member = null) {
  const submitBtn = document.getElementById("member-submit-btn");
  const memberIdInput = document.getElementById("member-id");
  const nameInput = document.getElementById("member-name");

  if (member) {
    submitBtn.textContent = "Lưu";
    memberIdInput.value = member.id;
    nameInput.value = member.name;
  } else {
    submitBtn.textContent = "Thêm thành viên";
    memberForm.reset();
  }

  memberModal.classList.remove("hidden");
}

function closeMemberModal() {
  memberModal.classList.add("hidden");
  memberForm.reset();
}

function handleMemberSubmit(e) {
  e.preventDefault();

  const memberId = document.getElementById("member-id").value;
  const name = document.getElementById("member-name").value;
  const avatar = name.charAt(0).toUpperCase();

  if (memberId) {
    // Edit existing member
    const member = state.members.find((m) => m.id == memberId);
    if (member) {
      member.name = name;
      member.avatar = avatar;
    }
  } else {
    // Create new member
    const colorIndex = state.members.length % colors.length;
    const newMember = {
      id: Date.now(),
      name,
      avatar,
      color: colors[colorIndex],
    };
    state.members.push(newMember);
  }

  renderMembers();
  renderTasks();
  closeMemberModal();
}

// Window Functions
window.editTask = (taskId) => {
  const task = state.tasks.find((t) => t.id === taskId);
  if (task) {
    openTaskModal(task);
  }
};

window.updateTaskStatus = (taskId, direction) => {
  const task = state.tasks.find((t) => t.id === taskId);
  const statuses = ["todo", "progress", "review", "done"];
  const currentIndex = statuses.indexOf(task.status);

  if (direction === "next") {
    if (currentIndex < statuses.length - 1) {
      moveTask(task.id, statuses[currentIndex + 1]);
    }
  } else if (direction === "prev" && currentIndex > 0) {
    moveTask(task.id, statuses[currentIndex - 1]);
  }

  renderTasks();
};

window.deleteTask = (taskId) => {
  if (confirm("Bạn có chắc chắn muốn xóa task này?")) {
    state.tasks = state.tasks.filter((t) => t.id !== taskId);
    renderTasks();
  }
};

window.editMember = (memberId) => {
  const member = state.members.find((m) => m.id === memberId);
  if (member) {
    openMemberModal(member);
  }
};

window.deleteMember = (memberId) => {
  if (state.members.length <= 1) {
    alert("Cần ít nhất 1 thành viên!");
    return;
  }
  if (confirm("Bạn có chắc chắn muốn xóa thành viên này?")) {
    state.members = state.members.filter((m) => m.id !== memberId);
    // If deleted user was current user, pick another
    if (state.currentUser == memberId && state.members.length > 0) {
      state.currentUser = state.members[0].id.toString();
    }
    renderMembers();
    renderTasks();
  }
};

window.selectUser = (userId) => {
  state.currentUser = userId.toString();
  if (currentUserSelect) {
    currentUserSelect.value = state.currentUser;
  }
  renderTasks();
  saveState();
};
const priorityRank = { low: 0, medium: 1, high: 2 };
const progressRank = { not_started: 0, in_progress: 1, in_review: 2, done: 3 };
const complexityRank = { easy: 0, medium: 1, hard: 2, very_hard: 3 };
const scoreWeights = { priority: 3, complexity: 2, progress: 1, deadline: 1 };

function statusToProgressState(status) {
  switch (status) {
    case "todo":
      return "not_started";
    case "progress":
      return "in_progress";
    case "review":
      return "in_review";
    case "done":
      return "done";
    default:
      return "in_progress";
  }
}

function progressStateToStatus(progressState) {
  switch (progressState) {
    case "not_started":
      return "todo";
    case "in_progress":
      return "progress";
    case "in_review":
      return "review";
    case "done":
      return "done";
    default:
      return "progress";
  }
}

function getPriorityText(priority) {
  switch (priority) {
    case "high":
      return "Cao";
    case "medium":
      return "Trung bình";
    case "low":
      return "Thấp";
    default:
      return "Trung bình";
  }
}

function getProgressText(progressState) {
  switch (progressState) {
    case "not_started":
      return "Chưa bắt đầu";
    case "in_progress":
      return "Đang thực hiện";
    case "in_review":
      return "Đang xem xét";
    case "done":
      return "Hoàn thành";
    default:
      return "Đang thực hiện";
  }
}

function getComplexityText(complexity) {
  switch (complexity) {
    case "easy":
      return "Dễ";
    case "medium":
      return "Trung bình";
    case "hard":
      return "Khó";
    case "very_hard":
      return "Rất khó";
    default:
      return "Trung bình";
  }
}

function computeDeadlineUrgency(deadline) {
  if (!deadline) return 0;
  const dayMs = 24 * 60 * 60 * 1000;
  const now = new Date();
  const due = new Date(deadline);
  if (Number.isNaN(due.getTime())) return 0;
  const daysLeft = Math.floor((due.getTime() - now.getTime()) / dayMs);
  if (daysLeft < 0) return 3;
  if (daysLeft <= 1) return 2;
  if (daysLeft <= 3) return 1;
  return 0;
}

function computeTaskScore(task) {
  const p = priorityRank[task.priority] ?? 1;
  const c = complexityRank[task.complexity] ?? 1;
  const pr = progressRank[task.progressState] ?? 1;
  const d = computeDeadlineUrgency(task.deadline);
  return (
    p * scoreWeights.priority +
    c * scoreWeights.complexity +
    pr * scoreWeights.progress +
    d * scoreWeights.deadline
  );
}

function getPriorityBadgeClass(priority) {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200";
    case "medium":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200";
    case "low":
      return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200";
    default:
      return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200";
  }
}

function getProgressBadgeClass(progressState) {
  switch (progressState) {
    case "not_started":
      return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200";
    case "in_progress":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200";
    case "in_review":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200";
    case "done":
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200";
    default:
      return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200";
  }
}

function getComplexityBadgeClass(complexity) {
  switch (complexity) {
    case "easy":
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200";
    case "medium":
      return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200";
    case "hard":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200";
    case "very_hard":
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200";
  }
}

function ensureTaskFields() {
  let changed = false;
  state.tasks.forEach((t) => {
    if (!t.priority) {
      t.priority = "medium";
      changed = true;
    }
    if (!t.complexity) {
      t.complexity = "medium";
      changed = true;
    }
    if (!t.progressState) {
      t.progressState = statusToProgressState(t.status);
      changed = true;
    }
    const expectedProgress = statusToProgressState(t.status);
    if (t.progressState !== expectedProgress) {
      t.progressState = expectedProgress;
      changed = true;
    }
  });
  if (changed) saveState();
}

function updateTaskStatusFromProgress(task) {
  const nextStatus = progressStateToStatus(task.progressState);
  if (task.status !== nextStatus) {
    let safeStatus = nextStatus;
    if (
      safeStatus === "done" &&
      (!task.reviewedBy || task.reviewedBy.length === 0) &&
      task.reviewStatus !== "approved"
    ) {
      safeStatus = "review";
      task.progressState = "in_review";
    }
    task.status = safeStatus;
    task.order = getNextOrder(safeStatus);
  }
}

function setupTaskViewControls() {
  if (!taskSortModeSelect) return;

  taskSortModeSelect.value = taskView.sortMode;
  if (taskFilterKeywordInput) taskFilterKeywordInput.value = taskView.keyword;
  if (taskFilterPrioritySelect)
    taskFilterPrioritySelect.value = taskView.filters.priority;
  if (taskFilterProgressSelect)
    taskFilterProgressSelect.value = taskView.filters.progress;
  if (taskFilterComplexitySelect)
    taskFilterComplexitySelect.value = taskView.filters.complexity;

  if (taskSort1Select)
    taskSort1Select.value = taskView.sort[0]?.field || "score";
  if (taskSort1DirSelect)
    taskSort1DirSelect.value = taskView.sort[0]?.dir || "desc";
  if (taskSort2Select)
    taskSort2Select.value = taskView.sort[1]?.field || "none";
  if (taskSort2DirSelect)
    taskSort2DirSelect.value = taskView.sort[1]?.dir || "desc";
  if (taskSort3Select)
    taskSort3Select.value = taskView.sort[2]?.field || "none";
  if (taskSort3DirSelect)
    taskSort3DirSelect.value = taskView.sort[2]?.dir || "desc";

  const onChange = () => {
    taskView.sortMode = taskSortModeSelect.value;
    taskView.keyword = (taskFilterKeywordInput?.value || "").trim();
    taskView.filters.priority = taskFilterPrioritySelect?.value || "all";
    taskView.filters.progress = taskFilterProgressSelect?.value || "all";
    taskView.filters.complexity = taskFilterComplexitySelect?.value || "all";
    taskView.sort = [
      {
        field: taskSort1Select?.value || "score",
        dir: taskSort1DirSelect?.value || "desc",
      },
      {
        field: taskSort2Select?.value || "none",
        dir: taskSort2DirSelect?.value || "desc",
      },
      {
        field: taskSort3Select?.value || "none",
        dir: taskSort3DirSelect?.value || "desc",
      },
    ];
    saveTaskView();
    renderTasks();
  };

  taskSortModeSelect.onchange = onChange;
  if (taskFilterPrioritySelect) taskFilterPrioritySelect.onchange = onChange;
  if (taskFilterProgressSelect) taskFilterProgressSelect.onchange = onChange;
  if (taskFilterComplexitySelect)
    taskFilterComplexitySelect.onchange = onChange;
  if (taskSort1Select) taskSort1Select.onchange = onChange;
  if (taskSort1DirSelect) taskSort1DirSelect.onchange = onChange;
  if (taskSort2Select) taskSort2Select.onchange = onChange;
  if (taskSort2DirSelect) taskSort2DirSelect.onchange = onChange;
  if (taskSort3Select) taskSort3Select.onchange = onChange;
  if (taskSort3DirSelect) taskSort3DirSelect.onchange = onChange;

  if (taskFilterKeywordInput) {
    taskFilterKeywordInput.oninput = onChange;
  }
}

function ensureTaskOrder() {
  const statusOrder = ["todo", "progress", "review", "done"];
  statusOrder.forEach((status) => {
    const tasks = state.tasks.filter((t) => t.status === status);
    const hasAllOrders = tasks.every((t) => typeof t.order === "number");
    if (!hasAllOrders) {
      tasks
        .slice()
        .sort(
          (a, b) =>
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime(),
        )
        .forEach((t, idx) => {
          t.order = idx;
        });
    }
  });
}

function getNextOrder(status) {
  const orders = state.tasks
    .filter((t) => t.status === status)
    .map((t) => (typeof t.order === "number" ? t.order : -1));
  return orders.length ? Math.max(...orders) + 1 : 0;
}

function isAllowedTransition(fromStatus, toStatus) {
  if (fromStatus === toStatus) return true;
  const statuses = ["todo", "progress", "review", "done"];
  const fromIdx = statuses.indexOf(fromStatus);
  const toIdx = statuses.indexOf(toStatus);
  if (fromIdx === -1 || toIdx === -1) return false;
  return Math.abs(fromIdx - toIdx) === 1;
}

function moveTask(taskId, toStatus, beforeTaskId = null) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) return;

  ensureTaskOrder();

  const fromStatus = task.status;
  if (!isAllowedTransition(fromStatus, toStatus)) {
    alert("Chỉ được kéo task sang cột liền kề.");
    return;
  }
  if (
    fromStatus === "review" &&
    toStatus === "done" &&
    (!task.reviewedBy || task.reviewedBy.length === 0)
  ) {
    alert("Task cần được review trước khi hoàn thành!");
    return;
  }

  const getOrderedIds = (status) =>
    state.tasks
      .filter((t) => t.status === status)
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((t) => t.id);

  const fromIds = getOrderedIds(fromStatus).filter((id) => id !== taskId);
  const toIds =
    toStatus === fromStatus ? fromIds.slice() : getOrderedIds(toStatus).slice();

  const insertAt =
    beforeTaskId && toIds.includes(beforeTaskId)
      ? toIds.indexOf(beforeTaskId)
      : toIds.length;
  toIds.splice(insertAt, 0, taskId);

  task.status = toStatus;

  const applyOrders = (status, ids) => {
    ids.forEach((id, idx) => {
      const t = state.tasks.find((x) => x.id === id);
      if (t) t.order = idx;
    });
  };

  applyOrders(toStatus, toIds);
  if (toStatus !== fromStatus) {
    applyOrders(fromStatus, fromIds);
  }

  renderTasks();
}

function setupKanbanDragAndDrop() {
  const colConfigs = [
    { el: document.getElementById("col-todo"), status: "todo" },
    { el: document.getElementById("col-progress"), status: "progress" },
    { el: document.getElementById("col-review"), status: "review" },
    { el: document.getElementById("col-done"), status: "done" },
  ];

  colConfigs.forEach(({ el, status }) => {
    el.addEventListener("dragover", (e) => {
      e.preventDefault();
      el.classList.add("ring-2", "ring-indigo-400");
    });
    el.addEventListener("dragleave", () => {
      el.classList.remove("ring-2", "ring-indigo-400");
    });
    el.addEventListener("drop", (e) => {
      e.preventDefault();
      el.classList.remove("ring-2", "ring-indigo-400");
      const taskId = e.dataTransfer.getData("text/task-id");
      if (!taskId) return;
      moveTask(taskId, status);
    });
  });
}

function openTaskDetailModal(taskId) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task) return;

  const assignee = state.members.find((m) => m.id == task.assigneeId);

  const statusEl = document.getElementById("task-detail-status");
  const titleEl = document.getElementById("task-detail-title");
  const assigneeEl = document.getElementById("task-detail-assignee");
  const deadlineEl = document.getElementById("task-detail-deadline");
  const descEl = document.getElementById("task-detail-description");
  const metaEl = document.getElementById("task-detail-meta");
  const reviewWrapEl = document.getElementById("task-detail-review");
  const reviewEl = document.getElementById("task-detail-review-content");
  const reviewActionsEl = document.getElementById("task-detail-review-actions");
  const openReviewBtn = document.getElementById("task-detail-open-review");

  statusEl.innerHTML = `<span class="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getStatusColor(task.status)}">${getStatusText(task.status)}</span>`;
  titleEl.textContent = task.title;
  descEl.textContent = task.description || "";

  assigneeEl.innerHTML = `
    <div class="w-6 h-6 rounded-full ${assignee?.color || "bg-gray-400"} text-white flex items-center justify-center text-[10px] font-bold">
      ${assignee?.avatar || "?"}
    </div>
    <span class="font-semibold">${assignee?.name || "Unassigned"}</span>
  `;

  if (task.deadline) {
    deadlineEl.innerHTML = `
      <i class="lucide-calendar"></i>
      <span>${formatDate(task.deadline)}</span>
    `;
  } else {
    deadlineEl.innerHTML = "";
  }

  if (metaEl) {
    metaEl.innerHTML = `
      <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200">Điểm: ${computeTaskScore(task)}</span>
      <span class="text-[10px] font-bold px-2 py-0.5 rounded ${getPriorityBadgeClass(task.priority)}">Ưu tiên: ${getPriorityText(task.priority)}</span>
      <span class="text-[10px] font-bold px-2 py-0.5 rounded ${getProgressBadgeClass(task.progressState)}">Tiến độ: ${getProgressText(task.progressState)}</span>
      <span class="text-[10px] font-bold px-2 py-0.5 rounded ${getComplexityBadgeClass(task.complexity)}">Phức tạp: ${getComplexityText(task.complexity)}</span>
    `;
  }

  const isApproved =
    task.reviewStatus === "approved" ||
    (Array.isArray(task.reviewedBy) && task.reviewedBy.length > 0);
  const isRejected = task.reviewStatus === "rejected";
  const isPendingReview = task.status === "review" && canApprove(task);
  const hasReviewInfo = task.reviewStatus || task.reviewNote || isApproved;

  if (reviewWrapEl && reviewEl && reviewActionsEl && openReviewBtn) {
    if (!hasReviewInfo && !isPendingReview) {
      reviewWrapEl.classList.add("hidden");
      reviewActionsEl.classList.add("hidden");
      openReviewBtn.onclick = null;
    } else {
      reviewWrapEl.classList.remove("hidden");
      const status = isApproved
        ? "Phê duyệt"
        : isRejected
          ? "Từ chối"
          : "Đang review";
      const reviewerId = task.reviewBy || (task.reviewedBy || [])[0];
      const reviewer = state.members.find((m) => m.id == reviewerId);
      const time = task.reviewAt ? formatDate(task.reviewAt) : "";
      const lines = [
        hasReviewInfo ? `Kết quả: ${status}` : "",
        reviewer ? `Reviewer: ${reviewer.name}` : "",
        time ? `Thời gian: ${time}` : "",
        task.reviewNote ? `Ghi chú:\n${task.reviewNote}` : "",
      ].filter(Boolean);
      reviewEl.textContent = lines.join("\n");

      if (isPendingReview && !isApproved && !isRejected) {
        reviewActionsEl.classList.remove("hidden");
        openReviewBtn.onclick = () => openReviewModal(task.id);
      } else {
        reviewActionsEl.classList.add("hidden");
        openReviewBtn.onclick = null;
      }
    }
  }

  taskDetailModal.classList.remove("hidden");
  applyDarkMode();
}

function closeTaskDetailModal() {
  taskDetailModal.classList.add("hidden");
}

function exportData() {
  const data = {
    members: state.members,
    tasks: state.tasks,
    okrs: state.okrs,
    currentUser: state.currentUser,
    darkMode: state.darkMode,
    aiEnabled: state.aiEnabled,
    exportedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "3musk-backup.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      if (data.members && data.tasks) {
        state.members = data.members;
        state.tasks = data.tasks;
        state.okrs = data.okrs || [];
        state.currentUser =
          data.currentUser ||
          (state.members.length > 0 ? state.members[0].id.toString() : null);
        state.darkMode = !!data.darkMode;
        state.aiEnabled = data.aiEnabled ?? state.aiEnabled;
        applyDarkMode();
        renderMembers();
        renderOKRs();
        renderTasks();
        renderAiToggle();
        saveState();
        alert("Dữ liệu đã được import thành công!");
      } else {
        alert("File không hợp lệ!");
      }
    } catch (err) {
      alert("Lỗi khi đọc file!");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
}

// Start
init();
