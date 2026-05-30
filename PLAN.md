# Implementation Plan: The 3 Musketeers (3Musk)

## 1) Brief
- **Mục tiêu:** Xây dựng ứng dụng quản lý task tối giản dành riêng cho nhóm 3 người, giúp tối ưu hóa sự phối hợp và minh bạch công việc.
- **Phạm vi (In-scope):**
  - Giao diện Kanban Board cơ bản.
  - Quản lý danh sách 3 thành viên.
  - CRUD task (tạo, đọc, sửa, xóa).
  - Trạng thái Review bắt buộc từ thành viên khác.
- **Ngoài phạm vi (Out-of-scope):**
  - Hệ thống chat realtime.
  - Quản lý nhiều workspace/nhóm khác nhau.
  - Tích hợp bên thứ ba (Slack, Google Calendar).
- **Định nghĩa hoàn thành (DoD):**
  - [ ] Project khởi tạo thành công với Next.js và Tailwind.
  - [ ] Giao diện hiển thị đúng 3 cột trạng thái (Todo, In Progress, Done).
  - [ ] Có thể thêm task mới và gán cho 1 trong 3 Musketeers.
  - [ ] Task có thể kéo thả hoặc chuyển đổi trạng thái thủ công.
  - [ ] Dữ liệu được lưu trữ bền vững (LocalStorage).
  - [ ] Responsive tốt trên cả Mobile và Desktop.
  - [ ] Code được push lên GitHub repository thành công.

## 2) Clarifying questions (Cần hỏi sếp)
1. Bạn muốn sử dụng cơ sở dữ liệu thực (như Supabase/Firebase) ngay từ đầu hay dùng LocalStorage cho bản demo này? (Ưu tiên 1)
2. Có cần hệ thống đăng nhập (Authentication) không, hay chỉ cần nhập tên 3 thành viên là bắt đầu được luôn? (Ưu tiên 2)
3. Bạn có yêu cầu cụ thể nào về màu sắc thương hiệu cho "3Musk" không?
4. Task Review có cần cơ chế "Approve" bằng nút bấm chính thức không?

## 3) Generate Subtasks (WBS)
| Nhóm pha | Tên subtask | Mô tả | Deliverable | Owner | Estimate | Dependency |
|:---|:---|:---|:---|:---|:---|:---|
| **Chuẩn bị** | Khởi tạo Project | Setup Next.js, Tailwind, Lucide | Repo structure | Dev | S | None |
| **Thực hiện** | Build UI Layout | Tạo khung Dashboard và 3 cột Kanban | UI Components | Dev | M | Init |
| **Thực hiện** | Logic Quản lý Task | Implement CRUD task với LocalStorage | Task Service | Dev | M | Layout |
| **Thực hiện** | Member Management | UI/Logic quản lý 3 thành viên | Member Module | Dev | S | Init |
| **Kiểm tra** | Unit Test Logic | Kiểm tra các quy tắc nghiệp vụ (BR) | Test Report | QA/Dev | S | Logic |
| **Bàn giao** | Push to GitHub | Đẩy code và tài liệu lên repo | GitHub Repo | Dev | S | All |

## 4) Priority & Risks
- **Ưu tiên:**
  - Impact: 5/5 (Core functionality)
  - Urgency: 4/5 (Cần demo sớm)
  - Dependency: 5/5 (Nền tảng cho các tính năng sau)
- **Top 3 rủi ro & Cách giảm thiểu:**
  1. **Dữ liệu bị mất:** Sử dụng LocalStorage có rủi ro mất khi xóa cache -> Giải pháp: Thêm nút Export/Import JSON.
  2. **UI phức tạp quá mức:** Gây khó khăn cho nhóm nhỏ -> Giải pháp: Tuân thủ phong cách Minimalist.
  3. **Lỗi logic Review:** Task kẹt ở trạng thái Review -> Giải pháp: Cho phép Admin/Creator ghi đè (override).

## 5) Timeline đề xuất
- **Ngày 1:** Setup & UI Layout. (Milestone: UI Demo ready)
- **Ngày 2:** Core Logic & Task Management. (Milestone: Functional MVP)
- **Ngày 3:** Testing, Refinement & Handover. (Milestone: Push to GitHub)

## 6) Status update / standup mẫu
- **Done:** Đã xác định yêu cầu dự án và khởi tạo file REQUIREMENTS.md.
- **In progress:** Đang thiết lập cấu trúc project Next.js và build Layout Dashboard.
- **Next:** Thực hiện logic CRUD task và lưu trữ LocalStorage.
- **Blockers:** Chờ xác nhận về việc có dùng Auth hay không.
- **ETA:** 2 ngày tới.
