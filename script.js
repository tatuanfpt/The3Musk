// State Management
let state = {
    members: [
        { id: 1, name: 'Athos', color: 'bg-red-500', avatar: 'A' },
        { id: 2, name: 'Porthos', color: 'bg-blue-500', avatar: 'P' },
        { id: 3, name: 'Aramis', color: 'bg-green-500', avatar: 'Ar' }
    ],
    tasks: JSON.parse(localStorage.getItem('3musk_tasks')) || []
};

// DOM Elements
const taskModal = document.getElementById('task-modal');
const taskForm = document.getElementById('task-form');
const addTaskBtn = document.getElementById('add-task-btn');
const closeModalBtn = document.getElementById('close-modal');
const memberBadges = document.getElementById('member-badges');
const taskAssigneeSelect = document.getElementById('task-assignee');

// Initialize
function init() {
    renderMembers();
    renderTasks();
    setupEventListeners();
}

function renderMembers() {
    memberBadges.innerHTML = state.members.map(m => `
        <div class="w-8 h-8 rounded-full ${m.color} text-white flex items-center justify-center text-xs font-bold border-2 border-white ring-1 ring-gray-200" title="${m.name}">
            ${m.avatar}
        </div>
    `).join('');

    taskAssigneeSelect.innerHTML = state.members.map(m => `
        <option value="${m.id}">${m.name}</option>
    `).join('');
}

function renderTasks() {
    const cols = {
        todo: document.getElementById('col-todo'),
        progress: document.getElementById('col-progress'),
        done: document.getElementById('col-done')
    };

    const counts = {
        todo: document.getElementById('count-todo'),
        progress: document.getElementById('count-progress'),
        done: document.getElementById('count-done'),
        total: document.getElementById('stat-total'),
        statProgress: document.getElementById('stat-progress'),
        statDone: document.getElementById('stat-done')
    };

    // Clear columns
    Object.values(cols).forEach(col => col.innerHTML = '');

    let statusCounts = { todo: 0, progress: 0, done: 0 };

    state.tasks.forEach(task => {
        const assignee = state.members.find(m => m.id == task.assigneeId);
        const taskEl = document.createElement('div');
        taskEl.className = 'bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group';
        taskEl.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <span class="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getStatusColor(task.status)}">
                    ${task.status}
                </span>
                <button onclick="deleteTask('${task.id}')" class="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <i class="lucide-trash-2 text-sm"></i>
                </button>
            </div>
            <h4 class="font-semibold text-gray-800 mb-1">${task.title}</h4>
            <p class="text-sm text-gray-500 mb-4 line-clamp-2">${task.description}</p>
            <div class="flex justify-between items-center pt-3 border-t border-gray-100">
                <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full ${assignee.color} text-white flex items-center justify-center text-[10px] font-bold">
                        ${assignee.avatar}
                    </div>
                    <span class="text-xs text-gray-600 font-medium">${assignee.name}</span>
                </div>
                <div class="flex gap-1">
                    ${task.status !== 'todo' ? `<button onclick="updateTaskStatus('${task.id}', 'prev')" class="p-1 hover:bg-gray-100 rounded"><i class="lucide-chevron-left text-xs text-gray-400"></i></button>` : ''}
                    ${task.status !== 'done' ? `<button onclick="updateTaskStatus('${task.id}', 'next')" class="p-1 hover:bg-gray-100 rounded text-indigo-600"><i class="lucide-chevron-right text-xs"></i></button>` : ''}
                </div>
            </div>
        `;
        
        cols[task.status].appendChild(taskEl);
        statusCounts[task.status]++;
    });

    // Update counts
    counts.todo.textContent = statusCounts.todo;
    counts.progress.textContent = statusCounts.progress;
    counts.done.textContent = statusCounts.done;
    counts.total.textContent = state.tasks.length;
    counts.statProgress.textContent = statusCounts.progress;
    counts.statDone.textContent = statusCounts.done;

    // Save to localstorage
    localStorage.setItem('3musk_tasks', JSON.stringify(state.tasks));
}

function getStatusColor(status) {
    switch(status) {
        case 'todo': return 'bg-gray-100 text-gray-600';
        case 'progress': return 'bg-blue-100 text-blue-600';
        case 'done': return 'bg-green-100 text-green-600';
        default: return 'bg-gray-100';
    }
}

function setupEventListeners() {
    addTaskBtn.onclick = () => taskModal.classList.remove('hidden');
    closeModalBtn.onclick = () => taskModal.classList.add('hidden');
    
    taskForm.onsubmit = (e) => {
        e.preventDefault();
        const newTask = {
            id: Date.now().toString(),
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-desc').value,
            assigneeId: document.getElementById('task-assignee').value,
            status: 'todo',
            createdAt: new Date().toISOString()
        };
        
        state.tasks.push(newTask);
        renderTasks();
        taskForm.reset();
        taskModal.classList.add('hidden');
    };

    // Close modal on outside click
    window.onclick = (e) => {
        if (e.target == taskModal) taskModal.classList.add('hidden');
    };
}

window.updateTaskStatus = (taskId, direction) => {
    const task = state.tasks.find(t => t.id === taskId);
    const statuses = ['todo', 'progress', 'done'];
    const currentIndex = statuses.indexOf(task.status);
    
    if (direction === 'next' && currentIndex < statuses.length - 1) {
        task.status = statuses[currentIndex + 1];
    } else if (direction === 'prev' && currentIndex > 0) {
        task.status = statuses[currentIndex - 1];
    }
    
    renderTasks();
};

window.deleteTask = (taskId) => {
    if (confirm('Bạn có chắc chắn muốn xóa task này?')) {
        state.tasks = state.tasks.filter(t => t.id !== taskId);
        renderTasks();
    }
};

// Start
init();
