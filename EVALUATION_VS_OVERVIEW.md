# So sánh tiêu chí đánh giá vs Overview (3Musk + One Thing)

Nguồn Overview: [REQUIREMENTS.md](file:///Users/tuanta/Project/2026/The3Musk/REQUIREMENTS.md), [README.md](file:///Users/tuanta/Project/2026/The3Musk/README.md)

## 1) Mapping theo tiêu chí (theo trọng số)

### 1.1. Innovation & Originality (20%)

Khớp với Overview:
- “One Thing” (ưu tiên 1 việc quan trọng nhất trong ngày) + “Focus Mode”
- Quy tắc Review & Approval bắt buộc trước khi Done
- Tối ưu cho nhóm nhỏ 1–5 người (tập trung, ít nhiễu)

Điểm nên nhấn mạnh khi pitch:
- “Behavior change” thay vì “thêm một kanban”: ép ưu tiên, giảm context-switch, tăng accountability.

### 1.2. TRAE Integration Depth (30%)

Khớp với Overview:
- Có “One Thing Chat Assistant” và các tính năng AI theo context workspace (members, tasks).

Khoảng trống so với tiêu chí:
- Overview hiện chưa nêu rõ TRAE là “unified entry point”.
- Chưa mô tả rõ “multi-source + cross-role collaboration” (ngoài dữ liệu local).

Cách pitch để ăn điểm:
- Xác định “TRAE là cửa vào duy nhất” cho workflow ưu tiên → làm → review → done.
- Demo “context unification”: assistant trả lời dựa trên workspace (task, deadline, trạng thái review/approve).
- Nêu chiến lược “multi-source” theo mức khả thi:
  - Hiện tại: Export/Import JSON như cầu nối (FR-06)
  - Roadmap: ingest từ nguồn khác về cùng một schema để assistant xử lý thống nhất

### 1.3. Usability & Design (20%)

Khớp với Overview:
- UI tối giản, tập trung hành động; responsive; dark/light; cảnh báo overdue.
- Kanban trạng thái rõ ràng + thao tác nhanh (prev/next).

Điểm nên nhấn mạnh khi pitch:
- “30 giây onboarding”: mở app → thấy One Thing → làm → đẩy Review → người khác approve.

### 1.4. Business Impact & Feasibility (30%)

Khớp với Overview:
- Target đúng pain-point nhóm nhỏ: làm nhanh, ra quyết định nhanh, giảm rework.
- Review gate giúp tăng chất lượng và tính trách nhiệm.
- Feasibility cao: static HTML/JS + LocalStorage + deploy GitHub Pages.
- Có tiêu chí phi chức năng rõ (tải nhanh, responsive).

Điểm nên nhấn mạnh khi pitch:
- Tác động đo được theo ngôn ngữ ROI:
  - Giảm rework nhờ review bắt buộc trước Done
  - Giảm trễ deadline nhờ cảnh báo overdue + ưu tiên One Thing
  - Giảm họp/nhắn tin “hôm nay làm gì” nhờ assistant trả lời tức thì theo context

## 2) Thông điệp pitch bám trọng số

### 2.1. Cấu trúc nội dung
- 60% thời lượng: TRAE Integration Depth + Business Impact (2 tiêu chí 30%).
- 40% còn lại: Innovation + Usability.

### 2.2. Tagline gợi ý
- “TRAE + 3Musk biến cộng tác nhóm nhỏ thành một luồng: ưu tiên → làm → review → done, không lạc trong danh sách việc.”

### 2.3. Demo flow gợi ý (3 người)
- Người A hỏi assistant trong TRAE: “One Thing hôm nay là gì?” → trả về task + lý do ưu tiên.
- A thực hiện và chuyển sang Review.
- Người B review/approve.
- Người C nhìn dashboard/assistant để ra quyết định tiếp theo (task nào bị trễ, ai đang bị overload).
