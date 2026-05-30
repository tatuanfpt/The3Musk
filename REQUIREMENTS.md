# Project: 3Musk - OneThing OKR Task Manager

## 1. Business Objective
Dự án **3Musk - OneThing** được xây dựng nhằm giúp sếp quản lý và phân công công việc cho coder một cách có hệ thống. Hệ thống tự động phân tích yêu cầu để phân loại mức độ ưu tiên, độ khó, và tự động break down công việc thành các Key Results (OKR) - giúp coder biết rõ mình cần làm gì và sếp dễ dàng theo dõi tiến độ.

- **Mục tiêu 1:** Tự động phân loại ưu tiên dựa trên deadline và độ quan trọng.
- **Mục tiêu 2:** Đánh giá độ khó tự động dựa trên từ khóa và độ dài mô tả.
- **Mục tiêu 3:** Break down công việc thành OKR (Objective - Key Results) để coder có hướng đi rõ ràng.
- **Mục tiêu 4:** Theo dõi tiến độ tự động dựa trên % hoàn thành Key Results.

## 2. Business Rules (Quy tắc nghiệp vụ)
- **BR-01:** Mỗi task chính (Objective) bắt buộc phải có deadline.
- **BR-02:** Task không có deadline mặc định được gán P2 (Thấp).
- **BR-03:** Task có deadline < 24h: P0 (Cao nhất), < 3 ngày: P1 (Cao), còn lại: P2 (Thấp).
- **BR-04:** Độ khó được tính dựa trên từ khóa: "thiết kế", "tích hợp", "API" = Khó; "sửa", "cập nhật" = Dễ; còn lại = Trung bình.
- **BR-05:** Mỗi Objective phải có ít nhất 3 Key Results được tự động tạo hoặc thêm thủ công.
- **BR-06:** Tiến độ task = (Số Key Results hoàn thành / Tổng số Key Results) × 100%.

## 3. System Requirements Specification (SRS)

### 3.1. Functional Requirements (Yêu cầu chức năng)
| ID | Chức năng | Mô tả chi tiết | Ưu tiên |
|:---|:---|:---|:---|
| FR-01 | Nhận Task từ Sếp | Form nhập công việc với tiêu đề, mô tả, deadline, người nhận. | High |
| FR-02 | Auto Priority | Tự động phân loại P0/P1/P2 dựa trên deadline và từ khóa quan trọng ("gấp", "khẩn"). | High |
| FR-03 | Auto Difficulty | Tự động đánh giá độ khó dựa trên nội dung mô tả và từ khóa kỹ thuật. | High |
| FR-04 | OKR Breakdown | Tự động tạo 3-5 Key Results từ mô tả task bằng AI pattern matching. | High |
| FR-05 | Progress Tracker | Dashboard hiển thị % hoàn thành từng task dựa trên Key Results. | High |
| FR-06 | AI Writer | Viết lại, sửa ngữ pháp, tóm tắt nội dung task/docs. | Medium |
| FR-07 | AI Knowledge | Hỏi đáp dựa trên ngữ cảnh workspace (tasks, comments). | Medium |
| FR-08 | Member Management | Quản lý 3 thành viên: Athos, Porthos, Aramis. | High |

### 3.2. Non-functional Requirements (Yêu cầu phi chức năng)
- **Hiệu năng:** Tải dashboard < 1.5 giây.
- **Bảo mật:** Lưu trữ LocalStorage, mã hóa dữ liệu nhạy cảm.
- **Tính khả dụng:** Responsive trên Mobile và Desktop.
- **UX:** Giao diện tối giản, tập trung vào hành động (Action-first).

### 3.3. System Architecture & Constraints
- **Frontend:** HTML5, Tailwind CSS (CDN), Vanilla JavaScript ES6+.
- **State Management:** LocalStorage với reactive pattern.
- **AI Features:** Mockup API (sẵn sàng kết nối OpenAI/Claude khi cần).
- **Deployment:** GitHub Pages.

## 4. OKR Model Specification

### 4.1. Task Structure (Objective)
```
{
  id: string,
  title: string,           // Tên công việc (Objective)
  description: string,     // Mô tả chi tiết
  priority: "P0" | "P1" | "P2",
  difficulty: "Dễ" | "Trung bình" | "Khó",
  status: "Chưa thực hiện" | "Đang thực hiện" | "Tạm ngưng" | "Đã xong",
  progress: 0-100,         // Auto-calculated từ Key Results
  deadline: Date,
  assignee: Member,
  keyResults: KeyResult[], // OKR breakdown
  createdAt: Date,
  notes: string
}
```

### 4.2. Key Result Structure
```
{
  id: string,
  title: string,           // Mục tiêu con cần đạt
  completed: boolean,
  completedAt: Date
}
```

### 4.3. Auto-Breakdown Rules
| Keywords trong mô tả | Auto Key Results được tạo |
|---|---|
| "thiết kế", "design" | [Research], [Draft wireframe], [Implement], [Review] |
| "API", "tích hợp" | [Setup], [Implement endpoint], [Test], [Document] |
| "sửa lỗi", "bug" | [Reproduce], [Identify root cause], [Fix], [Test regression] |
| "cập nhật", "update" | [Read current], [Modify], [Test], [Deploy] |
| Mặc định | [Research], [Plan], [Execute], [Verify] |

---
*Tài liệu cập nhật: 2025 - Model OKR tự động*
