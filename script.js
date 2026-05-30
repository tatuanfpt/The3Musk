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
  const taskModalContent = document.getElementById("task-modal-content");
  const memberModalContent = document.getElementById("member-modal-content");
  const inputs = document.querySelectorAll("input, textarea, select");

  if (state.darkMode) {
    body.classList.add("bg-gray-900", "text-white");
    body.classList.remove("bg-gray-50", "text-gray-900");
    navbar.classList.add("bg-gray-800", "border-gray-700");
    navbar.classList.remove("bg-white", "border-gray-200");
    statCards.forEach((card) => {
      card.classList.add("bg-gray-800", "border-gray-700");
      card.classList.remove("bg-white", "border-gray-200");
      card.querySelector("p").classList.add("text-gray-400");
      card.querySelector("p").classList.remove("text-gray-500");
    });
    taskModalContent.classList.add("bg-gray-800");
    taskModalContent.classList.remove("bg-white");
    memberModalContent.classList.add("bg-gray-800");
    memberModalContent.classList.remove("bg-white");
    inputs.forEach((input) => {
      input.classList.add("bg-gray-700", "text-white", "border-gray-600");
      input.classList.remove("bg-white", "text-gray-900", "border-gray-300");
    });
    darkModeBtn.innerHTML = '<i class="lucide-moon"></i>';
  } else {
    body.classList.remove("bg-gray-900", "text-white");
    body.classList.add("bg-gray-50", "text-gray-900");
    navbar.classList.remove("bg-gray-800", "border-gray-700");
    navbar.classList.add("bg-white", "border-gray-200");
    statCards.forEach((card) => {
      card.classList.remove("bg-gray-800", "border-gray-700");
      card.classList.add("bg-white", "border-gray-200");
      card.querySelector("p").classList.remove("text-gray-400");
      card.querySelector("p").classList.add("text-gray-500");
    });
    taskModalContent.classList.remove("bg-gray-800");
    taskModalContent.classList.add("bg-white");
    memberModalContent.classList.remove("bg-gray-800");
    memberModalContent.classList.add("bg-white");
    inputs.forEach((input) => {
      input.classList.remove("bg-gray-700", "text-white", "border-gray-600");
      input.classList.add("bg-white", "text-gray-900", "border-gray-300");
    });
    darkModeBtn.innerHTML = '<i class="lucide-sun"></i>';
  }
}

// Render Members
function renderMembers() {
  // Render badges
  memberBadges.innerHTML = state.members
    .map(
      (m) => `
    <div class="w-8 h-8 rounded-full ${m.color} text-white flex items-center justify-center text-xs font-bold border-2 border-white ring-1 ring-gray-200 cursor-pointer" title="${m.name}" onclick="selectUser(${m.id})">
      ${m.avatar}
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
        <div class="flex gap-1">
          ${task.status !== "todo" ? `<button onclick="updateTaskStatus('${task.id}', 'prev')" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><i class="lucide-chevron-left text-sm text-gray-500"></i></button>` : ""}
          ${task.status !== "done" && !(task.status === "review" && !canApprove(task)) ? `<button onclick="updateTaskStatus('${task.id}', 'next')" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-indigo-600"><i class="lucide-chevron-right text-sm"></i></button>` : ""}
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

  const approved = task.reviewedBy.length > 0;

  if (approved) {
    const approver = state.members.find((m) => m.id == task.reviewedBy[0]);
    return `
      <div class="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
        <i class="lucide-check-circle"></i>
        Đã review bởi ${approver?.name || "someone"}
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
    if (!task.reviewedBy) {
      task.reviewedBy = [];
    }
    task.reviewedBy.push(state.currentUser);
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

  // Close modals on outside click
  window.onclick = (e) => {
    if (e.target === taskModal) closeTaskModal();
    if (e.target === memberModal) closeMemberModal();
  };
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
    if (state.currentUser === memberId && state.members.length > 0) {
      state.currentUser = state.members[0].id;
    }
    renderMembers();
    renderTasks();
  }
};

window.selectUser = (userId) => {
  state.currentUser = userId;
  renderTasks();
  const user = state.members.find((m) => m.id === userId);
  alert(`Đã chọn ${user?.name} làm người dùng hiện tại`);
};

function exportData() {
  const data = {
    members: state.members,
    tasks: state.tasks,
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
        renderMembers();
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
