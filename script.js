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
                  target > 0 ? Math.round((Math.min(current, target) / target) * 100) : 0;
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
  const id = kr?.id || Date.now().toString() + Math.random().toString(16).slice(2);

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
  const tasksToRender = state.tasks
    .slice()
    .sort((a, b) => {
      const aStatus = statusOrder[a.status] ?? 999;
      const bStatus = statusOrder[b.status] ?? 999;
      if (aStatus !== bStatus) return aStatus - bStatus;
      return (a.order ?? 0) - (b.order ?? 0);
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
    moveTask(task.id, "done");
    return;
  }

  task.reviewedBy = [];
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

  const content = type === "optimize-title" ? titleInput.value : descInput.value;
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
      `Chào Musketeer! Bạn có thể dùng:\n- Tab One Thing: “hôm nay làm gì?”, “task của tôi?”\n- Tab Workspace: “tổng quan”, “status”, “OKR”\n- AI Writer: Optimize title / Fix Grammar / Summarize / Professional`,
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
  const counts = computeStatusCounts();

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

  return "Bạn có thể hỏi: “tổng quan/status”, “OKR”, hoặc “task của tôi?”.";
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

function processOneThingQuery(query) {
  const lowerQuery = query.toLowerCase();

  if (
    lowerQuery.includes("hôm nay") ||
    lowerQuery.includes("today") ||
    lowerQuery.includes("one thing")
  ) {
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

  if (lowerQuery.includes("task của tôi") || lowerQuery.includes("my tasks")) {
    const myTasks = getCurrentUserTasks();
    if (myTasks.length === 0) {
      return "Bạn không có task nào! 🎉";
    }
    return `📋 **Your Tasks** (${myTasks.length})

${myTasks
  .map(
    (task, idx) =>
      `${idx + 1}. ${task.title} [${getStatusText(task.status)}]${
        task.deadline ? ` - ${formatDate(task.deadline)}` : ""
      }`,
  )
  .join("\n")}`;
  }

  if (lowerQuery.includes("team") || lowerQuery.includes("team ra sao")) {
    const statusCounts = { todo: 0, progress: 0, review: 0, done: 0 };
    state.tasks.forEach((t) => statusCounts[t.status]++);

    return `👥 **Team Overview**

- Tổng tasks: ${state.tasks.length}
- Cần làm: ${statusCounts.todo}
- Đang làm: ${statusCounts.progress}
- Đang review: ${statusCounts.review}
- Hoàn thành: ${statusCounts.done}

Thành viên:
${state.members.map((m) => `- ${m.name}`).join("\n")}`;
  }

  return "Xin lỗi, tôi không hiểu câu hỏi! Hãy thử hỏi: 'hôm nay làm gì?' hoặc 'task của tôi?'";
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
    // Check if trying to move from review to done without approval
    if (
      task.status === "review" &&
      (!task.reviewedBy || task.reviewedBy.length === 0)
    ) {
      alert("Task cần được review trước khi hoàn thành!");
      return;
    }
    if (currentIndex < statuses.length - 1) {
      task.status = statuses[currentIndex + 1];
    }
  } else if (direction === "prev" && currentIndex > 0) {
    task.status = statuses[currentIndex - 1];
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
    toStatus === fromStatus
      ? fromIds.slice()
      : getOrderedIds(toStatus).slice();

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
        applyDarkMode();
        renderMembers();
        renderOKRs();
        renderTasks();
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
