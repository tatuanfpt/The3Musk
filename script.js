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
  darkMode: JSON.parse(localStorage.getItem("3musk_darkMode")) || false,
  currentUser: null, // For review purposes - we'll use this to track who's approving
};

// Initialize current user (just pick first member for demo)
if (state.members.length > 0 && !state.currentUser) {
  state.currentUser = state.members[0].id;
}

// DOM Elements
const taskModal = document.getElementById("task-modal");
const taskForm = document.getElementById("task-form");
const addTaskBtn = document.getElementById("add-task-btn");
const closeModalBtn = document.getElementById("close-modal");
const memberBadges = document.getElementById("member-badges");
const taskAssigneeSelect = document.getElementById("task-assignee");
const memberModal = document.getElementById("member-modal");
const memberForm = document.getElementById("member-form");
const manageMembersBtn = document.getElementById("manage-members-btn");
const closeMemberModalBtn = document.getElementById("close-member-modal");
const memberList = document.getElementById("member-list");
const darkModeBtn = document.getElementById("dark-mode-btn");
const exportBtn = document.getElementById("export-btn");
const importFile = document.getElementById("import-file");
// One Thing DOM Elements
const oneThingBtn = document.getElementById("one-thing-btn");
const oneThingPanel = document.getElementById("one-thing-panel");
const closeOneThingBtn = document.getElementById("close-one-thing-btn");
const oneThingForm = document.getElementById("one-thing-form");
const oneThingInput = document.getElementById("one-thing-input");
const oneThingMessages = document.getElementById("one-thing-messages");
const focusModeBtn = document.getElementById("focus-mode-btn");
const focusModeOverlay = document.getElementById("focus-mode-overlay");
const closeFocusModeBtn = document.getElementById("close-focus-mode-btn");
const focusModeTask = document.getElementById("focus-mode-task");

// Initialize
function init() {
  applyDarkMode();
  renderMembers();
  renderTasks();
  setupEventListeners();
}

// Save state to localStorage
function saveState() {
  localStorage.setItem("3musk_members", JSON.stringify(state.members));
  localStorage.setItem("3musk_tasks", JSON.stringify(state.tasks));
  localStorage.setItem("3musk_darkMode", JSON.stringify(state.darkMode));
}

function applyDarkMode() {
  document.documentElement.classList.toggle("dark", !!state.darkMode);
  document.documentElement.style.colorScheme = state.darkMode
    ? "dark"
    : "light";
  darkModeBtn.innerHTML = state.darkMode
    ? '<i class="lucide-moon"></i>'
    : '<i class="lucide-sun"></i>';
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isTaskApproved(task) {
  return Array.isArray(task.reviewedBy) && task.reviewedBy.length > 0;
}

// Render Members
function renderMembers() {
  // Render badges
  memberBadges.innerHTML = state.members
    .map(
      (m) => `
    <div class="w-8 h-8 rounded-full ${m.color} text-white flex items-center justify-center text-xs font-bold border-2 border-white ${m.id == state.currentUser ? "ring-2 ring-indigo-500" : "ring-1 ring-gray-200"} cursor-pointer" title="${escapeHtml(m.name)}" onclick="selectUser(${m.id})">
      ${escapeHtml(m.avatar)}
    </div>
  `,
    )
    .join("");

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

// Render Tasks
function renderTasks() {
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

  state.tasks.forEach((task) => {
    const assignee = state.members.find((m) => m.id == task.assigneeId);
    const approved = task.status === "review" ? isTaskApproved(task) : false;
    const taskEl = document.createElement("div");
    taskEl.className =
      "bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group dark:bg-gray-800 dark:border-gray-700";

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
          <button onclick="editTask('${task.id}')" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <i class="lucide-edit text-sm text-gray-500"></i>
          </button>
          <button onclick="deleteTask('${task.id}')" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <i class="lucide-trash-2 text-sm text-red-500"></i>
          </button>
        </div>
      </div>
      <h4 class="font-semibold text-gray-800 dark:text-white mb-1">${escapeHtml(task.title)}</h4>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">${escapeHtml(task.description || "")}</p>
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
            ${escapeHtml(assignee?.avatar || "?")}
          </div>
          <span class="text-xs text-gray-600 dark:text-gray-300 font-medium">${escapeHtml(assignee?.name || "Unassigned")}</span>
        </div>
        <div class="flex gap-1">
          ${task.status !== "todo" ? `<button onclick="updateTaskStatus('${task.id}', 'prev')" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><i class="lucide-chevron-left text-sm text-gray-500"></i></button>` : ""}
          ${task.status !== "done" && !(task.status === "review" && !approved) ? `<button onclick="updateTaskStatus('${task.id}', 'next')" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-indigo-600"><i class="lucide-chevron-right text-sm"></i></button>` : ""}
        </div>
      </div>
    `;

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

  const approved = isTaskApproved(task);

  if (approved) {
    const approver = state.members.find((m) => m.id == task.reviewedBy[0]);
    return `
      <div class="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
        <i class="lucide-check-circle"></i>
        Đã review bởi ${escapeHtml(approver?.name || "someone")}
      </div>
    `;
  }

  if (canApprove(task)) {
    return `
      <button onclick="approveTask('${task.id}')" class="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded hover:bg-green-600 transition-colors">
        Approve
      </button>
    `;
  }

  return `
    <span class="text-xs text-gray-500">Chờ người khác review</span>
  `;
}

function approveTask(taskId) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (task && canApprove(task)) {
    const reviewedBy = Array.isArray(task.reviewedBy) ? task.reviewedBy : [];
    if (!reviewedBy.includes(state.currentUser)) {
      reviewedBy.push(state.currentUser);
    }
    task.reviewedBy = reviewedBy;
    renderTasks();
  }
}

// Event Listeners
function setupEventListeners() {
  // Task Modal
  addTaskBtn.onclick = () => openTaskModal();
  closeModalBtn.onclick = () => closeTaskModal();
  taskForm.onsubmit = handleTaskSubmit;

  // Member Modal
  manageMembersBtn.onclick = () => openMemberModal();
  closeMemberModalBtn.onclick = () => closeMemberModal();
  memberForm.onsubmit = handleMemberSubmit;

  // Dark Mode
  darkModeBtn.onclick = () => {
    state.darkMode = !state.darkMode;
    applyDarkMode();
    saveState();
  };

  // Export/Import
  exportBtn.onclick = exportData;
  importFile.onchange = importData;

  // One Thing
  oneThingBtn.onclick = toggleOneThingPanel;
  closeOneThingBtn.onclick = toggleOneThingPanel;
  oneThingForm.onsubmit = handleOneThingSubmit;
  focusModeBtn.onclick = openFocusMode;
  closeFocusModeBtn.onclick = closeFocusMode;

  // Close modals on outside click
  window.onclick = (e) => {
    if (e.target === taskModal) closeTaskModal();
    if (e.target === memberModal) closeMemberModal();
    if (e.target === focusModeOverlay) closeFocusMode();
  };
}

// ----------------------
// One Thing Functions
// ----------------------

function toggleOneThingPanel() {
  oneThingPanel.classList.toggle("hidden");
  if (
    !oneThingPanel.classList.contains("hidden") &&
    oneThingMessages.children.length === 0
  ) {
    renderWelcomeMessage();
  }
}

function renderWelcomeMessage() {
  const message = {
    type: "bot",
    text: `Xin chào! Tôi là One Thing Assistant! Hãy hỏi tôi:
- "hôm nay làm gì?" để xem task ưu tiên nhất
- "task của tôi?" để xem tất cả task của bạn
- "team ra sao?" để xem tổng quan team`,
  };
  addOneThingMessage(message);
}

function addOneThingMessage(message) {
  const messageEl = document.createElement("div");
  messageEl.className = `flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`;
  const safeText = escapeHtml(message.text);
  messageEl.innerHTML = `
    <div class="max-w-[80%] p-3 rounded-2xl ${
      message.type === "user"
        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-sm"
        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm"
    }">
      <p class="text-sm whitespace-pre-wrap">${safeText}</p>
    </div>
  `;
  oneThingMessages.appendChild(messageEl);
  oneThingMessages.scrollTop = oneThingMessages.scrollHeight;
}

function handleOneThingSubmit(e) {
  e.preventDefault();
  const query = oneThingInput.value.trim();
  if (!query) return;

  // Add user message
  addOneThingMessage({ type: "user", text: query });
  oneThingInput.value = "";

  // Process query
  setTimeout(() => {
    const response = processOneThingQuery(query);
    addOneThingMessage({ type: "bot", text: response });
  }, 300);
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
      return "Chúc mừng! Bạn không còn task nào chưa hoàn thành!";
    }
    const assignee = state.members.find((m) => m.id == oneThing.assigneeId);
    return `One Thing Today:\n- ${oneThing.title}\n${oneThing.description ? `- ${oneThing.description}\n` : ""}- Người thực hiện: ${assignee?.name || "Unassigned"}\n${oneThing.deadline ? `- Hạn nộp: ${formatDate(oneThing.deadline)}\n` : ""}- Trạng thái: ${getStatusText(oneThing.status)}`;
  }

  if (lowerQuery.includes("task của tôi") || lowerQuery.includes("my tasks")) {
    const myTasks = getCurrentUserTasks();
    if (myTasks.length === 0) {
      return "Bạn không có task nào!";
    }
    return `Your Tasks (${myTasks.length})\n${myTasks
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

    return `Team Overview\n- Tổng tasks: ${state.tasks.length}\n- Cần làm: ${statusCounts.todo}\n- Đang làm: ${statusCounts.progress}\n- Đang review: ${statusCounts.review}\n- Hoàn thành: ${statusCounts.done}\n\nThành viên:\n${state.members.map((m) => `- ${m.name}`).join("\n")}`;
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
    modalTitle.textContent = "Thêm Task mới";
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
    if (task.status === "review" && !isTaskApproved(task)) {
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
    if (state.currentUser === memberId && state.members.length > 0) {
      state.currentUser = state.members[0].id;
    }
    renderMembers();
    renderTasks();
  }
};

window.selectUser = (userId) => {
  state.currentUser = userId;
  renderMembers();
  renderTasks();
};

function exportData() {
  const data = {
    members: state.members,
    tasks: state.tasks,
    exportedAt: new Date().toISOString(),
    version: 1,
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
      const normalized = normalizeImportedData(data);
      state.members = normalized.members;
      state.tasks = normalized.tasks;
      if (!state.members.some((m) => m.id == state.currentUser)) {
        state.currentUser = state.members[0]?.id ?? null;
      }
      renderMembers();
      renderTasks();
      alert("Dữ liệu đã được import thành công!");
    } catch (err) {
      alert(err?.message || "Lỗi khi đọc file!");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
}

function normalizeImportedData(data) {
  if (!data || typeof data !== "object") {
    throw new Error("File không hợp lệ: thiếu dữ liệu JSON.");
  }

  if (!Array.isArray(data.members) || !Array.isArray(data.tasks)) {
    throw new Error("File không hợp lệ: cần có members[] và tasks[].");
  }

  const members = data.members
    .map((m) => {
      const id = m?.id ?? Date.now();
      const name = typeof m?.name === "string" ? m.name.trim() : "";
      if (!name) return null;
      const avatar =
        typeof m?.avatar === "string" && m.avatar.trim()
          ? m.avatar.trim()
          : name.slice(0, 2).toUpperCase();
      const color = typeof m?.color === "string" ? m.color : colors[0];
      return { id, name, avatar, color };
    })
    .filter(Boolean);

  if (members.length === 0) {
    throw new Error("File không hợp lệ: members[] rỗng.");
  }

  const memberIdSet = new Set(members.map((m) => String(m.id)));

  const allowedStatuses = new Set(["todo", "progress", "review", "done"]);
  const tasks = data.tasks
    .map((t) => {
      const id = String(t?.id ?? Date.now());
      const title = typeof t?.title === "string" ? t.title.trim() : "";
      if (!title) return null;
      const description =
        typeof t?.description === "string" ? t.description : "";
      const assigneeId = t?.assigneeId ?? members[0].id;
      const status = allowedStatuses.has(t?.status) ? t.status : "todo";
      const deadline = typeof t?.deadline === "string" ? t.deadline : "";
      const createdAt =
        typeof t?.createdAt === "string"
          ? t.createdAt
          : new Date().toISOString();
      const reviewedBy = Array.isArray(t?.reviewedBy)
        ? t.reviewedBy.filter((x) => memberIdSet.has(String(x)))
        : [];

      if (!memberIdSet.has(String(assigneeId))) {
        return {
          id,
          title,
          description,
          assigneeId: members[0].id,
          deadline,
          status,
          createdAt,
          reviewedBy,
        };
      }

      return {
        id,
        title,
        description,
        assigneeId,
        deadline,
        status,
        createdAt,
        reviewedBy,
      };
    })
    .filter(Boolean);

  return { members, tasks };
}

// Start
init();
