// State Management
let state = {
    members: [
        { id: 1, name: 'Athos', color: 'bg-red-500', avatar: 'A' },
        { id: 2, name: 'Porthos', color: 'bg-blue-500', avatar: 'P' },
        { id: 3, name: 'Aramis', color: 'bg-green-500', avatar: 'Ar' }
    ],
    tasks: JSON.parse(localStorage.getItem('3musk_okr_tasks')) || [],
    currentFilter: 'all'
};

// DOM Elements
const taskModal = document.getElementById('task-modal');
const taskForm = document.getElementById('task-form');
const addTaskBtn = document.getElementById('add-task-btn');
const closeModalBtns = [document.getElementById('close-modal'), document.getElementById('close-modal-2')];
const memberBadges = document.getElementById('member-badges');
const taskAssigneeSelect = document.getElementById('task-assignee');
const aiPanel = document.getElementById('ai-panel');
const aiAssistantBtn = document.getElementById('ai-assistant-btn');
const closeAiPanelBtn = document.getElementById('close-ai-panel');
const aiInput = document.getElementById('ai-input');
const sendAiBtn = document.getElementById('send-ai-query');
const aiChatHistory = document.getElementById('ai-chat-history');

// Initialize
function init() {
    renderMembers();
    renderTasks();
    renderAssigneeFilter();
    setupEventListeners();
    setupAutoAnalysis();
}

// ============= MEMBER MANAGEMENT =============
function renderMembers() {
    memberBadges.innerHTML = state.members.map(m => `
        <div class="w-9 h-9 rounded-full ${m.color} text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm" title="${m.name}">
            ${m.avatar}
        </div>
    `).join('');

    taskAssigneeSelect.innerHTML = state.members.map(m => `
        <option value="${m.id}">${m.name}</option>
    `).join('');
}

function renderAssigneeFilter() {
    const filter = document.getElementById('assignee-filter');
    filter.innerHTML = '<option value="">Tất cả thành viên</option>' + 
        state.members.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
}

// ============= OKR LOGIC =============
// Auto calculate Priority based on deadline and keywords
function calculatePriority(title, description, deadline) {
    const text = (title + ' ' + description).toLowerCase();
    const urgentKeywords = ['gấp', 'khẩn', 'urgent', 'asap', ' inmediatamente'];
    const hasUrgent = urgentKeywords.some(k => text.includes(k));
    
    if (hasUrgent) return 'P0';
    
    if (!deadline) return 'P2';
    
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const daysLeft = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 0) return 'P0'; // Overdue
    if (daysLeft <= 1) return 'P0'; // Less than 24h
    if (daysLeft <= 3) return 'P1'; // Less than 3 days
    return 'P2';
}

// Auto calculate Difficulty based on keywords
function calculateDifficulty(description) {
    const text = description.toLowerCase();
    const hardKeywords = ['thiết kế', 'design', 'tích hợp', 'api', 'database', 'security', 'architecture', 'kiến trúc'];
    const easyKeywords = ['sửa', 'fix', 'cập nhật', 'update', 'text', 'content', 'copy'];
    
    if (hardKeywords.some(k => text.includes(k))) return 'Khó';
    if (easyKeywords.some(k => text.includes(k))) return 'Dễ';
    return 'Trung bình';
}

// Auto generate Key Results based on description keywords
function generateKeyResults(description) {
    const text = description.toLowerCase();
    let results = [];
    
    if (text.includes('thiết kế') || text.includes('design')) {
        results = [
            { id: Date.now().toString(), title: '📊 Research & Analyze requirements', completed: false },
            { id: (Date.now() + 1).toString(), title: '📐 Create wireframe/mockup', completed: false },
            { id: (Date.now() + 2).toString(), title: '⚙️ Implement design', completed: false },
            { id: (Date.now() + 3).toString(), title: '✅ Review & QA', completed: false }
        ];
    } else if (text.includes('api') || text.includes('tích hợp')) {
        results = [
            { id: Date.now().toString(), title: '🔧 Setup environment', completed: false },
            { id: (Date.now() + 1).toString(), title: '📡 Implement API endpoints', completed: false },
            { id: (Date.now() + 2).toString(), title: '🧪 Write unit tests', completed: false },
            { id: (Date.now() + 3).toString(), title: '📝 Document API', completed: false }
        ];
    } else if (text.includes('sửa') || text.includes('lỗi') || text.includes('bug')) {
        results = [
            { id: Date.now().toString(), title: '🔍 Reproduce bug', completed: false },
            { id: (Date.now() + 1).toString(), title: '🎯 Identify root cause', completed: false },
            { id: (Date.now() + 2).toString(), title: '🛠️ Fix the issue', completed: false },
            { id: (Date.now() + 3).toString(), title: '🧪 Test regression', completed: false }
        ];
    } else {
        results = [
            { id: Date.now().toString(), title: '📖 Research & understand', completed: false },
            { id: (Date.now() + 1).toString(), title: '📋 Create execution plan', completed: false },
            { id: (Date.now() + 2).toString(), title: '⚡ Execute implementation', completed: false },
            { id: (Date.now() + 3).toString(), title: '✅ Verify & finalize', completed: false }
        ];
    }
    
    return results;
}

// Calculate progress based on Key Results
function calculateProgress(keyResults) {
    if (!keyResults || keyResults.length === 0) return 0;
    const completed = keyResults.filter(kr => kr.completed).length;
    return Math.round((completed / keyResults.length) * 100);
}

// Calculate days remaining
function calculateDaysRemaining(deadline) {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    return Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
}

// ============= AUTO ANALYSIS SETUP =============
function setupAutoAnalysis() {
    const titleInput = document.getElementById('task-title');
    const descInput = document.getElementById('task-desc');
    const deadlineInput = document.getElementById('task-deadline');
    
    const updateAnalysis = () => {
        const priority = calculatePriority(titleInput.value, descInput.value, deadlineInput.value);
        const difficulty = calculateDifficulty(descInput.value);
        const days = calculateDaysRemaining(deadlineInput.value);
        
        document.getElementById('auto-analysis').classList.remove('hidden');
        
        const priorityEl = document.getElementById('auto-priority');
        priorityEl.textContent = priority;
        priorityEl.className = `ml-2 px-2 py-0.5 rounded text-xs font-bold text-white priority-${priority}`;
        
        const diffEl = document.getElementById('auto-difficulty');
        diffEl.textContent = difficulty;
        diffEl.className = `ml-2 px-2 py-0.5 rounded text-xs font-bold`;
        if (difficulty === 'Dễ') diffEl.classList.add('bg-green-100', 'text-green-700');
        else if (difficulty === 'Khó') diffEl.classList.add('bg-red-100', 'text-red-700');
        else diffEl.classList.add('bg-yellow-100', 'text-yellow-700');
        
        document.getElementById('auto-days').textContent = days !== null ? `${days} ngày` : 'Không có DL';
    };
    
    titleInput.addEventListener('input', updateAnalysis);
    descInput.addEventListener('input', updateAnalysis);
    deadlineInput.addEventListener('change', updateAnalysis);
}

// ============= KEY RESULTS MANAGEMENT =============
let krCounter = 0;
function addKeyResult(title = '') {
    const list = document.getElementById('key-results-list');
    const id = 'kr-' + (Date.now() + krCounter++);
    const div = document.createElement('div');
    div.className = 'flex gap-2 items-center';
    div.innerHTML = `
        <input type="checkbox" id="${id}" class="w-4 h-4 text-indigo-600 rounded" ${title.includes('✅') ? 'checked' : ''}>
        <input type="text" value="${title.replace(/^[✅📊📐⚙️📝🔧📡🧪🔍🎯🛠️📖📋⚡✅]+ /g, '')}" 
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Key Result...">
        <button type="button" onclick="this.parentElement.remove()" class="text-gray-400 hover:text-red-500">
            <i class="lucide-trash-2 text-sm"></i>
        </button>
    `;
    list.appendChild(div);
}

// ============= TASK RENDERING =============
function renderTasks() {
    const list = document.getElementById('task-list');
    const emptyState = document.getElementById('empty-state');
    
    let filteredTasks = state.tasks;
    
    // Apply priority filter
    if (state.currentFilter !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.priority === state.currentFilter);
    }
    
    // Apply assignee filter
    const assigneeFilter = document.getElementById('assignee-filter').value;
    if (assigneeFilter) {
        filteredTasks = filteredTasks.filter(t => t.assigneeId == assigneeFilter);
    }
    
    // Sort by priority
    const priorityOrder = { 'P0': 0, 'P1': 1, 'P2': 2 };
    filteredTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    if (filteredTasks.length === 0) {
        list.innerHTML = '';
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        list.innerHTML = filteredTasks.map(task => renderTaskCard(task)).join('');
    }
    
    updateStats();
    saveState();
}

function renderTaskCard(task) {
    const assignee = state.members.find(m => m.id == task.assigneeId);
    const daysLeft = calculateDaysRemaining(task.deadline);
    const progress = calculateProgress(task.keyResults);
    
    let deadlineClass = 'text-gray-500';
    if (daysLeft !== null) {
        if (daysLeft < 0) deadlineClass = 'text-red-600 font-bold';
        else if (daysLeft <= 1) deadlineClass = 'text-red-500';
        else if (daysLeft <= 3) deadlineClass = 'text-orange-500';
    }
    
    let difficultyClass = 'diff-medium';
    if (task.difficulty === 'Dễ') difficultyClass = 'diff-easy';
    else if (task.difficulty === 'Khó') difficultyClass = 'diff-hard';
    
    return `
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-5 ${difficultyClass} cursor-pointer" onclick="openTaskDetail('${task.id}')">
            <div class="flex justify-between items-start mb-3">
                <div class="flex items-center gap-2">
                    <span class="px-2.5 py-1 rounded text-xs font-bold text-white priority-${task.priority}">${task.priority}</span>
                    <span class="px-2 py-0.5 rounded text-xs font-medium ${getDifficultyBg(task.difficulty)}">${task.difficulty}</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-xs ${deadlineClass}">
                        <i class="lucide-calendar text-xs mr-1"></i>
                        ${task.deadline ? formatDate(task.deadline) : 'Không có deadline'}
                        ${daysLeft !== null ? ` (${daysLeft < 0 ? Math.abs(daysLeft) + ' ngày quá hạn' : daysLeft + ' ngày'})` : ''}
                    </span>
                </div>
            </div>
            
            <h3 class="font-bold text-gray-800 mb-2 text-lg">${task.title}</h3>
            <p class="text-sm text-gray-500 mb-4 line-clamp-2">${task.description || 'Không có mô tả'}</p>
            
            <!-- Progress Bar -->
            <div class="mb-4">
                <div class="flex justify-between text-xs mb-1">
                    <span class="text-gray-500">Tiến độ (${task.keyResults?.length || 0} Key Results)</span>
                    <span class="font-bold ${progress === 100 ? 'text-green-600' : 'text-gray-700'}">${progress}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all ${progress === 100 ? 'bg-green-500' : 'bg-indigo-500'}" style="width: ${progress}%"></div>
                </div>
            </div>
            
            <div class="flex justify-between items-center pt-3 border-t border-gray-100">
                <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full ${assignee?.color || 'bg-gray-400'} text-white flex items-center justify-center text-xs font-bold">
                        ${assignee?.avatar || '?'}
                    </div>
                    <span class="text-sm font-medium text-gray-700">${assignee?.name || 'Chưa gán'}</span>
                </div>
                <div class="flex gap-2">
                    <button onclick="event.stopPropagation(); toggleTaskStatus('${task.id}')" class="text-xs px-3 py-1.5 rounded-lg font-semibold ${getStatusBtnClass(task.status)}">
                        ${getStatusText(task.status)}
                    </button>
                    <button onclick="event.stopPropagation(); deleteTask('${task.id}')" class="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                        <i class="lucide-trash-2 text-sm"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function getDifficultyBg(diff) {
    if (diff === 'Dễ') return 'bg-green-100 text-green-700';
    if (diff === 'Khó') return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
}

function getStatusBtnClass(status) {
    switch(status) {
        case 'Đã xong': return 'bg-green-100 text-green-700';
        case 'Đang thực hiện': return 'bg-blue-100 text-blue-700';
        case 'Tạm ngưng': return 'bg-gray-100 text-gray-600';
        default: return 'bg-gray-100 text-gray-500';
    }
}

function getStatusText(status) {
    switch(status) {
        case 'Đã xong': return '✓ Hoàn thành';
        case 'Đang thực hiện': return '⟳ Đang làm';
        case 'Tạm ngưng': return '⏸ Tạm ngưng';
        default: return '○ Chưa thực hiện';
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ============= TASK DETAIL =============
window.openTaskDetail = (taskId) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const assignee = state.members.find(m => m.id == task.assigneeId);
    const progress = calculateProgress(task.keyResults);
    
    const detailContent = document.getElementById('detail-content');
    detailContent.innerHTML = `
        <div class="flex justify-between items-start mb-6">
            <div>
                <span class="px-3 py-1 rounded text-sm font-bold text-white priority-${task.priority} mr-2">${task.priority}</span>
                <span class="px-2 py-0.5 rounded text-xs font-medium ${getDifficultyBg(task.difficulty)}">${task.difficulty}</span>
            </div>
            <button onclick="closeDetailModal()" class="text-gray-400 hover:text-gray-600">
                <i class="lucide-x text-xl"></i>
            </button>
        </div>
        
        <h2 class="text-2xl font-bold mb-4">${task.title}</h2>
        
        <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-xs text-gray-500 mb-1">Người nhận</p>
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full ${assignee?.color || 'bg-gray-400'} text-white flex items-center justify-center text-xs font-bold">${assignee?.avatar}</div>
                    <span class="font-semibold">${assignee?.name}</span>
                </div>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-xs text-gray-500 mb-1">Deadline</p>
                <p class="font-semibold">${task.deadline ? formatDate(task.deadline) : 'Không có'}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-xs text-gray-500 mb-1">Tiến độ</p>
                <p class="font-bold text-indigo-600">${progress}%</p>
            </div>
        </div>
        
        ${task.description ? `
        <div class="mb-6">
            <h3 class="font-semibold text-gray-700 mb-2">Mô tả</h3>
            <p class="text-gray-600 bg-gray-50 p-4 rounded-lg">${task.description}</p>
        </div>
        ` : ''}
        
        <div class="mb-6">
            <h3 class="font-semibold text-gray-700 mb-3">Key Results (OKR)</h3>
            <div class="space-y-2">
                ${(task.keyResults || []).map(kr => `
                    <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <input type="checkbox" ${kr.completed ? 'checked' : ''} 
                            onchange="toggleKeyResult('${task.id}', '${kr.id}')"
                            class="w-5 h-5 text-indigo-600 rounded">
                        <span class="${kr.completed ? 'line-through text-gray-400' : 'text-gray-700'} flex-1">${kr.title}</span>
                        ${kr.completed ? '<span class="text-xs text-green-600 font-semibold">✓</span>' : ''}
                    </div>
                `).join('')}
            </div>
        </div>
        
        ${task.notes ? `
        <div class="mb-6">
            <h3 class="font-semibold text-gray-700 mb-2">Ghi chú</h3>
            <p class="text-gray-600 bg-yellow-50 p-4 rounded-lg border border-yellow-100">${task.notes}</p>
        </div>
        ` : ''}
        
        <div class="flex justify-between items-center pt-4 border-t border-gray-200">
            <button onclick="toggleTaskStatus('${task.id}')" class="px-6 py-2 rounded-lg font-semibold ${getStatusBtnClass(task.status)}">
                ${getStatusText(task.status)}
            </button>
            <button onclick="deleteTask('${task.id}'); closeDetailModal()" class="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg font-semibold">
                Xóa Task
            </button>
        </div>
    `;
    
    document.getElementById('detail-modal').classList.remove('hidden');
};

window.closeDetailModal = () => {
    document.getElementById('detail-modal').classList.add('hidden');
};

window.toggleKeyResult = (taskId, krId) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const kr = task.keyResults.find(k => k.id === krId);
    if (kr) {
        kr.completed = !kr.completed;
        if (kr.completed) kr.completedAt = new Date().toISOString();
    }
    
    // Auto update task status if all KRs completed
    const allCompleted = task.keyResults.every(k => k.completed);
    if (allCompleted && task.status !== 'Đã xong') {
        task.status = 'Đã xong';
    }
    
    renderTasks();
    openTaskDetail(taskId);
    saveState();
};

window.toggleTaskStatus = (taskId) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const statusOrder = ['Chưa thực hiện', 'Đang thực hiện', 'Tạm ngưng', 'Đã xong'];
    const currentIndex = statusOrder.indexOf(task.status);
    task.status = statusOrder[(currentIndex + 1) % 4];
    
    renderTasks();
    saveState();
};

window.deleteTask = (taskId) => {
    if (confirm('Bạn có chắc muốn xóa task này?')) {
        state.tasks = state.tasks.filter(t => t.id !== taskId);
        renderTasks();
        saveState();
    }
};

window.filterTasks = (filter) => {
    if (filter) state.currentFilter = filter;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-gray-200', 'text-gray-700');
        if (btn.textContent.toLowerCase().includes(state.currentFilter)) {
            btn.classList.add('active', 'bg-gray-200', 'text-gray-700');
        }
    });
    
    renderTasks();
};

// ============= STATS =============
function updateStats() {
    document.getElementById('stat-total').textContent = state.tasks.length;
    document.getElementById('stat-p0').textContent = state.tasks.filter(t => t.priority === 'P0').length;
    document.getElementById('stat-p1').textContent = state.tasks.filter(t => t.priority === 'P1').length;
    document.getElementById('stat-progress').textContent = state.tasks.filter(t => t.status === 'Đang thực hiện').length;
    document.getElementById('stat-done').textContent = state.tasks.filter(t => t.status === 'Đã xong').length;
}

// ============= LOCAL STORAGE =============
function saveState() {
    localStorage.setItem('3musk_okr_tasks', JSON.stringify(state.tasks));
}

// ============= EVENT LISTENERS =============
function setupEventListeners() {
    addTaskBtn.onclick = () => {
        document.getElementById('key-results-list').innerHTML = '';
        addKeyResult('📖 Research & understand');
        addKeyResult('📋 Create execution plan');
        addKeyResult('⚡ Execute implementation');
        addKeyResult('✅ Verify & finalize');
        taskModal.classList.remove('hidden');
        document.getElementById('task-title').focus();
    };
    
    closeModalBtns.forEach(btn => btn.onclick = () => taskModal.classList.add('hidden'));
    
    window.onclick = (e) => {
        if (e.target === taskModal) taskModal.classList.add('hidden');
        if (e.target === document.getElementById('detail-modal')) closeDetailModal();
    };
    
    taskForm.onsubmit = (e) => {
        e.preventDefault();
        
        const keyResults = [];
        document.querySelectorAll('#key-results-list > div').forEach(div => {
            const checkbox = div.querySelector('input[type="checkbox"]');
            const input = div.querySelector('input[type="text"]');
            if (input.value.trim()) {
                keyResults.push({
                    id: checkbox.id,
                    title: input.value.trim(),
                    completed: checkbox.checked,
                    completedAt: checkbox.checked ? new Date().toISOString() : null
                });
            }
        });
        
        const newTask = {
            id: Date.now().toString(),
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-desc').value,
            assigneeId: document.getElementById('task-assignee').value,
            deadline: document.getElementById('task-deadline').value,
            notes: document.getElementById('task-notes').value,
            priority: calculatePriority(
                document.getElementById('task-title').value,
                document.getElementById('task-desc').value,
                document.getElementById('task-deadline').value
            ),
            difficulty: calculateDifficulty(document.getElementById('task-desc').value),
            status: 'Chưa thực hiện',
            keyResults: keyResults.length > 0 ? keyResults : generateKeyResults(document.getElementById('task-desc').value),
            createdAt: new Date().toISOString()
        };
        
        state.tasks.push(newTask);
        renderTasks();
        taskForm.reset();
        document.getElementById('auto-analysis').classList.add('hidden');
        taskModal.classList.add('hidden');
    };
    
    // AI Panel Events
    aiAssistantBtn.onclick = () => aiPanel.classList.remove('translate-x-full');
    closeAiPanelBtn.onclick = () => aiPanel.classList.add('translate-x-full');
    
    sendAiBtn.onclick = () => handleAiChat();
    aiInput.onkeypress = (e) => {
        if (e.key === 'Enter') handleAiChat();
    };
}

// ============= AI FEATURES =============
window.aiAction = (type) => {
    const titleInput = document.getElementById('task-title');
    const descInput = document.getElementById('task-desc');
    
    if (type === 'optimize-title') {
        if (!titleInput.value) return alert('Nhập tiêu đề trước!');
        titleInput.value = '[OKR] ' + titleInput.value.charAt(0).toUpperCase() + titleInput.value.slice(1);
    } else if (type === 'fix-grammar') {
        if (!descInput.value) return alert('Nhập mô tả trước!');
        descInput.value = descInput.value.replace(/\b(v[ií])\b/g, 'viết').replace(/\b(m[aà])\b/g, 'mà');
    } else if (type === 'summarize') {
        if (!descInput.value) return alert('Nhập mô tả trước!');
        const text = descInput.value;
        descInput.value = 'TÓM TẮT:\n' + text.substring(0, 100) + '...\n\n→ Cần thực hiện: ' + text.split('.').slice(0, 3).join('.');
    } else if (type === 'breakdown') {
        if (!descInput.value) return alert('Nhập mô tả trước!');
        const krs = generateKeyResults(descInput.value);
        document.getElementById('key-results-list').innerHTML = '';
        krs.forEach(kr => addKeyResult(kr.title));
    }
};

function handleAiChat() {
    const query = aiInput.value.trim();
    if (!query) return;

    appendChatMessage('user', query);
    aiInput.value = '';

    setTimeout(() => {
        let response = '';
        const taskCount = state.tasks.length;
        const p0Count = state.tasks.filter(t => t.priority === 'P0').length;
        const progressCount = state.tasks.filter(t => t.status === 'Đang thực hiện').length;
        const doneCount = state.tasks.filter(t => t.status === 'Đã xong').length;
        
        if (query.toLowerCase().includes('tổng quan') || query.toLowerCase().includes('status')) {
            response = `📊 **Báo cáo Workspace:**\n\n• Tổng task: ${taskCount}\n• P0 (Gấp): ${p0Count}\n• Đang thực hiện: ${progressCount}\n• Đã hoàn thành: ${doneCount}\n\n${doneCount > 0 ? '🎉 Tiến độ chung: ' + Math.round((doneCount/taskCount)*100) + '%' : ''}`;
        } else if (query.toLowerCase().includes('p0') || query.toLowerCase().includes('gấp')) {
            const p0Tasks = state.tasks.filter(t => t.priority === 'P0');
            response = p0Tasks.length > 0 
                ? '⚠️ **Task P0 - Cần ưu tiên:**\n' + p0Tasks.map(t => '• [' + t.priority + '] ' + t.title).join('\n')
                : '✅ Không có task P0 nào. Mọi thứ đang trong tầm kiểm soát!';
        } else if (query.toLowerCase().includes('ai')) {
            response = '🤖 Tôi có thể giúp bạn:\n• Phân tích tự động priority & difficulty\n• Tạo OKR breakdown cho task\n• Viết/sửa nội dung task\n\nChỉ cần nhấn các nút ✨ trong form tạo task!';
        } else {
            response = `Dựa trên phân tích workspace:\n\nTôi hiểu bạn hỏi về "${query}". Đây là bản demo AI - khi kết nối OpenAI/Claude API, tôi sẽ phân tích chi tiết hơn!`;
        }
        
        appendChatMessage('ai', response);
    }, 600);
}

function appendChatMessage(role, text) {
    const msg = document.createElement('div');
    msg.className = role === 'ai' 
        ? 'bg-white p-4 rounded-lg shadow-sm text-sm border border-purple-100' 
        : 'bg-indigo-600 text-white p-4 rounded-lg shadow-sm text-sm ml-8';
    msg.innerHTML = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    aiChatHistory.appendChild(msg);
    aiChatHistory.scrollTop = aiChatHistory.scrollHeight;
}

// ============= START =============
init();
