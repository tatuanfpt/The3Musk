# 3Musk - Task Breakdown & Assignment

---

## 👥 Team Roles
| Name | Role | Responsibilities |
|------|------|-------------------|
| **Tuấn** | Code Owner | Merge code, check quality, finalize product, Epic 3, 4, 5 |
| **Thắng** | Core Developer | Epic 1 (Member Management), Epic 2 (Task & Kanban) |
| **Nhật** | Feature Developer | Epic 6 (One Thing AI Assistant) |

---

## 📋 Task Breakdown by Person

---

### 🟡 Thắng's Tasks (Epic 1 & Epic 2)
*No conflicts with others, works on core foundation.*

#### Epic 1: Member Management
- [ ] **Task 1.1:** Build "Add Member" form UI + Logic
- [ ] **Task 1.2:** Build "Edit Member" UI + Logic
- [ ] **Task 1.3:** Build "Delete Member" with confirmation (check BR-04: can't delete last member)
- [ ] **Task 1.4:** Render member badges in navbar
- [ ] **Task 1.5:** Make sure member data is saved to LocalStorage

#### Epic 2: Task & Kanban Board
- [ ] **Task 2.1:** Build "Add Task" form (title, description, assignee, deadline)
- [ ] **Task 2.2:** Build "Edit Task" UI + Logic
- [ ] **Task 2.3:** Build "Delete Task" with confirmation
- [ ] **Task 2.4:** Render Kanban board with 4 columns (Todo, Progress, Review, Done)
- [ ] **Task 2.5:** Implement task status change (prev/next buttons)
- [ ] **Task 2.6:** Render statistics (total, in-progress, review, done)
- [ ] **Task 2.7:** Show overdue task in red (BR-05)

---

### 🟢 Nhật's Tasks (Epic 6: One Thing AI Assistant)
*Works on separate feature (chat panel), minimal conflict.*

#### Epic 6: One Thing AI Assistant
- [ ] **Task 6.1:** Add "One Thing" button to navbar
- [ ] **Task 6.2:** Build chat panel UI (messages list, input field, send button)
- [ ] **Task 6.3:** Implement basic chatbot logic (pattern matching for questions):
  - "hôm nay làm gì" / "what to do today"
  - "task của tôi" / "my tasks"
  - "team ra sao" / "team status"
- [ ] **Task 6.4:** Implement "One Thing" prioritization (pick task with earliest deadline, or closest to due date)
- [ ] **Task 6.5:** Render "One Thing" with highlight
- [ ] **Task 6.6:** Implement "Focus Mode" (hide all tasks except "One Thing")

---

### 🔵 Tuấn's Tasks (Epic 3, 4, 5 & Merge/Code Check)
*Code Owner, handles remaining features and final integration.*

#### Epic 3: Review & Approval
- [ ] **Task 3.1:** Build "Approve" button on tasks in Review column
- [ ] **Task 3.2:** Implement "canApprove" check (BR-03: can't approve own task)
- [ ] **Task 3.3:** Show who approved the task
- [ ] **Task 3.4:** Block moving to Done without approval (alert message)

#### Epic 4: UX Features
- [ ] **Task 4.1:** Implement Dark/Light mode toggle
- [ ] **Task 4.2:** Save theme preference to LocalStorage
- [ ] **Task 4.3:** Apply dark mode styles to all components

#### Epic 5: Data Backup
- [ ] **Task 5.1:** Build "Export" button to download JSON file
- [ ] **Task 5.2:** Build "Import" button to upload JSON file
- [ ] **Task 5.3:** Validate JSON before import (check valid structure)

#### Merge & Code Check
- [ ] **Task M.1:** Review Thắng's code (Epic 1 & 2)
- [ ] **Task M.2:** Review Nhật's code (Epic 6)
- [ ] **Task M.3:** Merge all branches to main
- [ ] **Task M.4:** Final test of all features
- [ ] **Task M.5:** Deploy to GitHub Pages

---

## 🚀 Order of Execution (Avoid Conflicts!)
1. **Thắng** starts first (builds core foundation)
2. **Nhật** starts in parallel (works on chat panel, doesn't affect core)
3. **Tuấn** starts after Thắng finishes Epic 1 & 2 (works on Review, UX, Backup)
4. **Tuấn** merges all code at the end

---

## 📁 File Structure & Ownership
| File | Owner | Notes |
|------|-------|-------|
| `index.html` | Tuấn (final) | Thắng & Nhật can add sections, Tuấn reviews |
| `script.js` | Tuấn (final) | Split logic into sections for each person |
| `README.md` | Tuấn | Finalize documentation |
| `REQUIREMENTS.md` | Tuấn | Already updated |
| `PLAN.md` | Tuấn | Already updated |
| `TASK_BREAKDOWN.md` | Tuấn | This file |

---

## ✅ Definition of Done (DoD)
- Code follows existing style
- Works on both light/dark mode
- Responsive on mobile
- Data saved to LocalStorage
- Tested by developer
- No console errors
