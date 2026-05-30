# Project: 3Musk - Small Team Task Management with One Thing AI Assistant

---

## 1. Business Objective
Dự án **3Musk + One Thing** được xây dựng nhằm tối ưu hóa hiệu suất làm việc cho các nhóm nhỏ (đặc biệt là nhóm 3 người - "The Three Musketeers"). Mục tiêu là tạo ra một môi trường cộng tác chặt chẽ, với trợ lý AI "One Thing" giúp mọi người tập trung vào thứ quan trọng nhất mỗi ngày theo tinh thần "Một người vì mọi người, mọi người vì một người".

- **Mục tiêu 1:** Cung cấp giao diện quản lý task tối giản, tập trung vào hành động.
- **Mục tiêu 2:** Tăng cường tính trách nhiệm thông qua quy trình review bắt buộc.
- **Mục tiêu 3:** Xây dựng dashboard chung giúp nhóm ra quyết định nhanh chóng.
- **Mục tiêu 4:** Tích hợp trợ lý AI "One Thing" để tương tác, đề xuất task và tập trung vào ưu tiên hàng đầu mỗi ngày.

---

## 2. Business Rules (Quy tắc nghiệp vụ)
- **BR-01:** Một workspace cho phép từ 1 đến 5 thành viên (tối ưu nhóm nhỏ).
- **BR-02:** Mọi task phải được gán cho ít nhất một thành viên.
- **BR-03:** Task chỉ được chuyển sang "Done" nếu đã được review và approve bởi ít nhất 1 thành viên khác.
- **BR-04:** Không cho xóa thành viên cuối cùng.
- **BR-05:** Task quá hạn (deadline) sẽ hiển thị màu đỏ để cảnh báo.
- **BR-06:** "One Thing" là task ưu tiên cao nhất của người dùng trong ngày (dựa trên deadline và độ ưu tiên).
- **BR-07:** Người review (approver) phải khác người thực hiện (assignee).
- **BR-08:** Tiến độ (Progress) và trạng thái Kanban luôn đồng bộ:
  - Todo ↔ Chưa bắt đầu
  - Progress ↔ Đang thực hiện
  - Review ↔ Đang xem xét
  - Done ↔ Hoàn thành
- **BR-09:** Không được bypass review để đưa task sang Done:
  - Nếu cố gắng đặt Progress=Hoàn thành khi chưa approve, hệ thống tự giữ task ở Review.

---

## 3. System Requirements Specification (SRS)

### 3.1. Functional Requirements (Yêu cầu chức năng)

| ID | Chức năng | Mô tả chi tiết | Ưu tiên | Epic |
|---|---|---|---|---|
| FR-01 | Quản lý thành viên | Thêm/Sửa/Xóa thông tin thành viên | High | Epic 1 |
| FR-02 | Kanban Board | Hiển thị task theo 4 cột Todo/Progress/Review/Done; hỗ trợ kéo-thả (drag & drop) để đổi cột và đổi thứ tự trong cột | High | Epic 2 |
| FR-03 | Phân công Task | Tạo/Sửa task với người thực hiện, deadline, mô tả và các thuộc tính (ưu tiên/tiến độ/phức tạp) | High | Epic 2 |
| FR-04 | Task Detail Modal | Bấm vào task để xem chi tiết (description + metadata), và hành động liên quan (mở review khi đủ điều kiện) | High | Epic 2 |
| FR-05 | Review & Approval | Review Modal cho phép reviewer chỉnh sửa nội dung trước khi quyết định; kết quả: Approve hoặc Reject | High | Epic 3 |
| FR-06 | Auto State Transition | Approve tự động chuyển task sang Done; Reject đưa task về Progress | High | Epic 3 |
| FR-05 | Dark/Light Mode | Chuyển đổi theme, lưu preference | Medium | Epic 4 |
| FR-06 | Export/Import | Backup/restore dữ liệu JSON | Medium | Epic 5 |
| FR-07 | OKR | Quản lý Objectives/Key Results và tiến độ; hiển thị trong dashboard | Medium | Epic 5 |
| FR-08 | Sorting/Filtering/Ranking | Lọc theo từ khóa/ưu tiên/tiến độ/phức tạp; sắp xếp theo 1–3 tiêu chí; hỗ trợ xếp hạng theo Điểm (Score) | High | Epic 2 |
| FR-09 | One Thing Assistant | Trợ lý ưu tiên "One Thing" + Focus Mode; dùng chung một AI panel | High | Epic 6 |
| FR-10 | Unified AI Assistant | Một panel AI thống nhất (chat + tools), có thể bật/tắt sử dụng Gemini AI | Medium | Epic 6 |
| FR-11 | AI Writer Tools | Optimize title, fix grammar, summarize, rewrite tone trong form task | Medium | Backlog |
| FR-12 | Workspace Q&A | Hỏi đáp theo context workspace (members, tasks, OKR) trong cùng AI panel | Medium | Backlog |

### 3.2. Non-functional Requirements (Yêu cầu phi chức năng)
- **Hiệu năng:** Tải trang đầu tiên dưới 1.5 giây.
- **Tính khả dụng:** Responsive trên mobile, tablet, desktop; Dark/Light mode.
- **Bảo mật:** Lưu dữ liệu LocalStorage an toàn.

### 3.3. System Architecture & Constraints
- **Frontend:** HTML5, Tailwind CSS (CDN), JavaScript (Vanilla ES6+).
- **State Management:** Reactive state pattern với LocalStorage.
- **Backend/DB:** LocalStorage.
- **AI Integration (Gemini):**
  - Nếu dùng Gemini AI thật, frontend gọi qua API proxy `/api/gemini` để tránh lộ API key.
  - Có toggle để bật/tắt Gemini trong quá trình sử dụng (fallback sang rule-based nếu tắt).
- **Deployment:** GitHub Pages/Vercel (tùy cấu hình).

---

## 4. Data Model (Tóm tắt)

### 4.1. Task
- `title`, `description`, `assigneeId`, `deadline`
- `status`: `todo` | `progress` | `review` | `done`
- `priority`: `high` | `medium` | `low`
- `progressState`: `not_started` | `in_progress` | `in_review` | `done`
- `complexity`: `easy` | `medium` | `hard` | `very_hard`
- `reviewedBy`: danh sách reviewer đã approve
- `reviewStatus`: `approved` | `rejected` (ghi nhận kết quả review)

### 4.2. Scoring (Xếp hạng)
- Mục tiêu: ưu tiên task cần làm trước dựa trên mức quan trọng + độ phức tạp + trạng thái + độ gấp deadline.
- Công thức (weighted sum):
  - `Score = priority*3 + complexity*2 + progress*1 + deadlineUrgency*1`
  - `deadlineUrgency`: 0 (xa), 1 (≤3 ngày), 2 (≤1 ngày), 3 (quá hạn)

---

## 5. Team & Task Assignment
- **Anh Tuấn:** Code Owner (Merge, check code chính), chịu trách nhiệm sản phẩm chính).
- **Thắng:** Phụ trách Epic 1, Epic 2.
- **Nhật:** Phụ trách Epic 6 (One Thing AI Assistant).
- **Tuấn:** Phụ trách Epic 3, Epic 4, Epic 5, Merge code.

---

## 5. AI Assistant (Nâng cấp theo QC)

### 5.1. Input
- Người dùng chat tự nhiên bằng tiếng Việt (có thể không dấu / sai chính tả / câu hỏi mơ hồ).
- Ngữ cảnh hệ thống tối thiểu:
  - `members`, `tasks`, `okrs`, `currentUser`, `darkMode`, `aiEnabled` từ LocalStorage.

### 5.2. Processing (Workflow)
- Chuẩn hoá input: lower-case + normalize không dấu (phục vụ nhận diện ý định).
- Nhận diện ý định (intent) theo rule-based:
  - One Thing / task của tôi / task của người khác / overdue / team overview / OKR.
- Truy xuất dữ liệu theo ngữ cảnh:
  - Lọc theo assignee, trạng thái, deadline.
  - Nhóm theo `status` hoặc theo `deadline` (khi user yêu cầu).
- Sinh output theo template thống nhất (Context → Summary → Groups).

### 5.3. Output (Chuẩn cấu trúc)
- Luôn trả lời có cấu trúc rõ ràng:
  - Context (đang nói về ai/workspace)
  - Summary (total/active/overdue + breakdown status)
  - Groups (theo status/deadline)
- Không bỏ thông tin quan trọng của task: `title`, `status`, `deadline` (nếu có), review state (nếu có).

### 5.4. Dữ liệu demo (Seed)
- Tự khởi tạo dữ liệu demo khi LocalStorage chưa có task:
  - 3 members: Tuấn/Thắng/Nhật
  - tasks đa dạng status/deadline/review để demo hỏi đáp
  - có OKR mẫu để demo tab Workspace/OKR

### 5.5. Bảo mật & AI Key
- Không hardcode/commit API key vào repo.
- Nếu dùng Gemini qua `server.py`, phải set env var `GOOGLE_API_KEY` (hoặc `GEMINI_API_KEY`) khi chạy server.
- Nếu lỡ chia sẻ key công khai, cần rotate/revoke ngay trên Google Cloud Console.

---

## 6. PR Workflow & Verification

### 6.1. Quy trình PR (không push thẳng main)
1. `git fetch origin`
2. `git checkout feat/ai-knowledge-manager`
3. `git rebase origin/main` (resolve conflict nếu có)
4. Verify nhanh:
   - `node --check script.js`
   - mở local server để test UI
5. `git push origin feat/ai-knowledge-manager` (có thể cần `--force-with-lease` nếu vừa rebase)
6. Tạo PR:
   - `main <- feat/ai-knowledge-manager`

### 6.2. Checklist trước khi submit PR
- Không lỗi JS syntax/runtime.
- Seed demo tạo dữ liệu đa dạng, không trùng lặp cho mọi user.
- AI chat trả đúng cho câu hỏi: “Tuấn đang có task gì”, “task quá hạn”, “OKR”, “tổng quan/status”.

---

## 7. Đánh giá theo Productivity Enhancement Track (tự chấm)

### 7.1. Innovation & Originality (20%)
- Hiện tại: Kanban + Review gate (BR-03) + OKR + AI Assistant local-first (fallback khi không có API).
- Ước tính: 14/20
- Gap: chưa có “process orchestration” sâu (tự động hoá cross-tool) ngoài import/export.

### 7.2. TRAE Platform Integration Depth (30%)
- Hiện tại: AI Assistant là “hub” cho task/OKR trong một UI, có proxy `server.py` để gọi Gemini (tuỳ chọn).
- Ước tính: 16/30
- Gap: chưa tích hợp nhiều nguồn dữ liệu (GitHub/Jira/Sheets/Slack). Demo hiện tập trung vào LocalStorage + workflow nội bộ.

### 7.3. Usability & Design (20%)
- Hiện tại: UI chính thức từ `main`, có Dark/Light, Kanban drag/drop, AI panel có tab, seed demo tự chạy.
- Ước tính: 17/20
- Gap: cần thêm hướng dẫn “câu hỏi mẫu” ngay trong AI panel theo từng tab để user mới dễ thử.

### 7.4. Business Impact & Feasibility (30%)
- Hiện tại: BR-03 giảm lỗi “done ảo”, AI trả One Thing + task theo người + overdue giúp giảm thời gian hỏi/đồng bộ.
- Ước tính: 20/30
- Gap: cần chốt KPI/ROI rõ ràng hơn (time saved/user/day, error reduction) và đưa vào demo script.
