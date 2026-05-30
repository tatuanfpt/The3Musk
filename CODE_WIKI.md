# 3Musk Code Wiki

## 1. Project Overview
- **What it is:** A minimal browser-based Kanban task dashboard designed for a fixed team of 3 members (Athos, Porthos, Aramis).
- **Tech stack:** Static **HTML** + **Tailwind CSS (CDN)** + **Vanilla JavaScript (ES6+)** + **LocalStorage** persistence.
- **Entry points:** [index.html](file:///Users/tuanta/Project/2026/The3Musk/index.html), [script.js](file:///Users/tuanta/Project/2026/The3Musk/script.js)

Related docs:
- Requirements/spec: [REQUIREMENTS.md](file:///Users/tuanta/Project/2026/The3Musk/REQUIREMENTS.md)
- Implementation plan: [PLAN.md](file:///Users/tuanta/Project/2026/The3Musk/PLAN.md)
- Project readme: [README.md](file:///Users/tuanta/Project/2026/The3Musk/README.md)

## 2. Repository Structure
- [index.html](file:///Users/tuanta/Project/2026/The3Musk/index.html): UI shell (navbar, stats, 3 Kanban columns, “Add Task” modal).
- [script.js](file:///Users/tuanta/Project/2026/The3Musk/script.js): App state + rendering + event handling + LocalStorage persistence.
- [REQUIREMENTS.md](file:///Users/tuanta/Project/2026/The3Musk/REQUIREMENTS.md): Business rules + functional/non-functional requirements.
- [PLAN.md](file:///Users/tuanta/Project/2026/The3Musk/PLAN.md): Planning/WBS (note: mentions Next.js, but current repo is static HTML/JS).

## 3. Runtime Architecture (How the App Works)

### 3.1. High-Level Flow
- Browser loads [index.html](file:///Users/tuanta/Project/2026/The3Musk/index.html), then loads [script.js](file:///Users/tuanta/Project/2026/The3Musk/script.js#L116-L116).
- On load, [init](file:///Users/tuanta/Project/2026/The3Musk/script.js#L20-L24) runs and orchestrates:
  - Render member UI ([renderMembers](file:///Users/tuanta/Project/2026/The3Musk/script.js#L26-L36))
  - Render Kanban tasks and stats ([renderTasks](file:///Users/tuanta/Project/2026/The3Musk/script.js#L38-L102))
  - Wire UI events ([setupEventListeners](file:///Users/tuanta/Project/2026/The3Musk/script.js#L113-L138))

### 3.2. Architectural Pattern (Current)
This codebase is effectively a single-file “controller”:
- **State** is held in a global `state` object: [script.js:L2-L9](file:///Users/tuanta/Project/2026/The3Musk/script.js#L2-L9)
- **UI rendering** is imperative DOM manipulation:
  - Members: inject HTML strings via `innerHTML`
  - Tasks: clear columns then create task cards via `document.createElement(...)` and `innerHTML`
- **Persistence** is LocalStorage:
  - Load tasks at startup: [script.js:L8-L9](file:///Users/tuanta/Project/2026/The3Musk/script.js#L8-L9)
  - Save after every render: [renderTasks](file:///Users/tuanta/Project/2026/The3Musk/script.js#L100-L102)

### 3.3. Data Flow (Reactive-by-Rerender)
- **User action** (create/update/delete) mutates `state.tasks`.
- App calls `renderTasks()` which:
  - Recomputes counts
  - Rebuilds DOM for all columns
  - Writes `state.tasks` to LocalStorage

This is simple and predictable, but note it is full re-rendering rather than incremental updates.

## 4. Domain Model (In-Memory + Persisted)

### 4.1. Member Model
Defined in [script.js:L2-L7](file:///Users/tuanta/Project/2026/The3Musk/script.js#L2-L7):
- `id: number`
- `name: string`
- `color: string` (Tailwind class name)
- `avatar: string` (letters displayed in badge)

### 4.2. Task Model
Created in [setupEventListeners](file:///Users/tuanta/Project/2026/The3Musk/script.js#L117-L126):
- `id: string` (timestamp-based `Date.now().toString()`)
- `title: string`
- `description: string`
- `assigneeId: string` (selected member id from `<select>`)
- `status: "todo" | "progress" | "done"`
- `createdAt: string` (ISO8601)

### 4.3. Persistence Format
- LocalStorage key: `3musk_tasks` ([script.js:L8](file:///Users/tuanta/Project/2026/The3Musk/script.js#L8-L8), [script.js:L101](file:///Users/tuanta/Project/2026/The3Musk/script.js#L101-L101))
- Value: JSON array of task objects

## 5. Major “Modules” and Responsibilities

### 5.1. index.html (UI Composition)
- Defines fixed layout and “injection points” via element IDs:
  - Member badges container: [index.html:L25-L27](file:///Users/tuanta/Project/2026/The3Musk/index.html#L25-L27)
  - Stats values: [index.html:L39-L49](file:///Users/tuanta/Project/2026/The3Musk/index.html#L39-L49)
  - Kanban columns: [index.html:L62-L85](file:///Users/tuanta/Project/2026/The3Musk/index.html#L62-L85)
  - Modal + form inputs: [index.html:L89-L114](file:///Users/tuanta/Project/2026/The3Musk/index.html#L89-L114)
- Pulls external UI dependencies via CDN:
  - Tailwind: [index.html:L7](file:///Users/tuanta/Project/2026/The3Musk/index.html#L7-L7)
  - Lucide icons: [index.html:L8](file:///Users/tuanta/Project/2026/The3Musk/index.html#L8-L8)
  - Google Fonts: [index.html:L10-L11](file:///Users/tuanta/Project/2026/The3Musk/index.html#L10-L11)

### 5.2. script.js (State + Rendering + Events)
- State initialization + task loading: [script.js:L2-L9](file:///Users/tuanta/Project/2026/The3Musk/script.js#L2-L9)
- Rendering:
  - Members + assignee options: [renderMembers](file:///Users/tuanta/Project/2026/The3Musk/script.js#L26-L36)
  - Tasks/cards + stats + persistence: [renderTasks](file:///Users/tuanta/Project/2026/The3Musk/script.js#L38-L102)
- Events:
  - Modal open/close + create task + outside-click dismiss: [setupEventListeners](file:///Users/tuanta/Project/2026/The3Musk/script.js#L113-L138)
  - Status transitions (prev/next): [updateTaskStatus](file:///Users/tuanta/Project/2026/The3Musk/script.js#L140-L152)
  - Delete flow with confirmation: [deleteTask](file:///Users/tuanta/Project/2026/The3Musk/script.js#L154-L159)

## 6. Key Functions (Responsibilities and Notes)

### 6.1. init()
- Location: [script.js:L20-L24](file:///Users/tuanta/Project/2026/The3Musk/script.js#L20-L24)
- Responsibility: single startup entry that wires up the app.

### 6.2. renderMembers()
- Location: [script.js:L26-L36](file:///Users/tuanta/Project/2026/The3Musk/script.js#L26-L36)
- Responsibility:
  - Renders the 3 member badges in the navbar.
  - Populates the `<select>` inside the task modal.
- Dependency: assumes existence of `#member-badges` and `#task-assignee` in HTML.

### 6.3. renderTasks()
- Location: [script.js:L38-L102](file:///Users/tuanta/Project/2026/The3Musk/script.js#L38-L102)
- Responsibility:
  - Clears all columns.
  - Builds each task card, including:
    - Status pill color via [getStatusColor](file:///Users/tuanta/Project/2026/The3Musk/script.js#L104-L111)
    - Delete button calling global `deleteTask(...)`
    - Status nav buttons calling global `updateTaskStatus(...)`
  - Updates column counts and header stats.
  - Persists tasks to LocalStorage.
- Dependency: assumes task statuses map to existing columns (`todo`, `progress`, `done`) and that those columns exist in DOM.

### 6.4. setupEventListeners()
- Location: [script.js:L113-L138](file:///Users/tuanta/Project/2026/The3Musk/script.js#L113-L138)
- Responsibility:
  - Opens/closes modal.
  - Handles form submit to create a task.
  - Adds “click outside modal closes modal” behavior.
- Note: Created tasks always start in `todo` state.

### 6.5. updateTaskStatus(taskId, direction)
- Location: [script.js:L140-L152](file:///Users/tuanta/Project/2026/The3Musk/script.js#L140-L152)
- Responsibility: Moves task status between `todo -> progress -> done` or backwards, then triggers re-render.
- Implementation detail: exposed on `window` so it can be called from inline `onclick` handlers embedded in task-card HTML.

### 6.6. deleteTask(taskId)
- Location: [script.js:L154-L159](file:///Users/tuanta/Project/2026/The3Musk/script.js#L154-L159)
- Responsibility: Confirmation dialog, remove from array, re-render (which persists).

## 7. Dependency Relationships

### 7.1. Internal Dependencies
- [index.html](file:///Users/tuanta/Project/2026/The3Musk/index.html) defines IDs; [script.js](file:///Users/tuanta/Project/2026/The3Musk/script.js) queries those IDs directly.
- [script.js](file:///Users/tuanta/Project/2026/The3Musk/script.js) exposes `updateTaskStatus` and `deleteTask` on `window` because task cards include inline handlers: [script.js:L82-L84](file:///Users/tuanta/Project/2026/The3Musk/script.js#L82-L84), [script.js:L68-L70](file:///Users/tuanta/Project/2026/The3Musk/script.js#L68-L70)

### 7.2. External Dependencies (CDN)
- Tailwind CSS: [index.html:L7](file:///Users/tuanta/Project/2026/The3Musk/index.html#L7-L7)
- Lucide icon font: [index.html:L8](file:///Users/tuanta/Project/2026/The3Musk/index.html#L8-L8)
- Google Fonts (Inter): [index.html:L10-L11](file:///Users/tuanta/Project/2026/The3Musk/index.html#L10-L11)

## 8. How to Run

### 8.1. Quick Start (No Build Step)
- Open [index.html](file:///Users/tuanta/Project/2026/The3Musk/index.html) directly in a browser (Chrome/Firefox/Safari).

### 8.2. Run via Local Web Server (Recommended)
Some browsers apply stricter rules to `file://` pages; running a static server avoids those issues.

```bash
cd /Users/tuanta/Project/2026/The3Musk
python3 -m http.server 8000
```

Then open:
- `http://localhost:8000/`

### 8.3. Data Reset
- Tasks are stored in LocalStorage under key `3musk_tasks`.
- To reset: clear site data in DevTools (Application/Storage) or remove the key from LocalStorage.

## 9. Alignment With REQUIREMENTS.md (Current vs Planned)
The requirements document describes features that are not implemented in the current code:
- Statuses in code: `todo`, `progress`, `done` ([script.js:L142](file:///Users/tuanta/Project/2026/The3Musk/script.js#L142-L142))
- Requirements mention extra capabilities such as:
  - `review` state and “Done only after review” rule (BR-03): [REQUIREMENTS.md:L10-L15](file:///Users/tuanta/Project/2026/The3Musk/REQUIREMENTS.md#L10-L15)
  - Drag & drop across statuses: [REQUIREMENTS.md:L21-L23](file:///Users/tuanta/Project/2026/The3Musk/REQUIREMENTS.md#L21-L23)
  - Member CRUD (currently members are hard-coded): [REQUIREMENTS.md:L21-L22](file:///Users/tuanta/Project/2026/The3Musk/REQUIREMENTS.md#L21-L22)

This wiki documents the current repository implementation; treat REQUIREMENTS.md and PLAN.md as the intended roadmap/spec.

