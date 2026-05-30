# 3Musk - OneThing OKR Task Manager

> *"Sếp giao việc → Tự động OKR"*

**3Musk - OneThing** là hệ thống quản lý công việc thông minh dành cho nhóm nhỏ (3 người), được thiết kế theo mô hình **OKR (Objectives & Key Results)**. Hệ thống tự động phân tích yêu cầu để phân loại mức độ ưu tiên, đánh giá độ khó, và break down công việc thành các Key Results cụ thể.

## 🚀 Tính năng chính

### 🤖 Auto OKR System
- **Auto Priority:** Tự động phân loại P0/P1/P2 dựa trên deadline và từ khóa "gấp", "khẩn".
- **Auto Difficulty:** Đánh giá độ khó tự động dựa trên từ khóa kỹ thuật.
- **Auto OKR Breakdown:** Tạo 3-5 Key Results dựa trên nội dung công việc.

### 📊 Dashboard theo format Excel
- Thống kê theo P0/P1/P2 và trạng thái (Tổng, Đang thực hiện, Đã xong).
- Bộ lọc theo độ ưu tiên và theo thành viên.
- Progress bar tự động tính theo % Key Results hoàn thành.

### ✨ AI Assistant
- Phân tích workspace và báo cáo tiến độ.
- Hỏi đáp dựa trên ngữ cảnh workspace.
- Viết/sửa nội dung task.

### 👥 Member Focus
- 3 thành viên mặc định: **Athos, Porthos, Aramis**
- Giao việc và theo dõi theo từng người.

## 🛠 Công nghệ
- HTML5, Tailwind CSS (CDN), Vanilla JavaScript ES6+
- LocalStorage cho persistence
- Sẵn sàng kết nối OpenAI/Claude API

## 📂 Cấu trúc dự án
```
3Musk/
├── index.html          # Giao diện chính
├── script.js           # Logic OKR, AI features
├── REQUIREMENTS.md     # Đặc tả yêu cầu & OKR Model
├── PLAN.md             # Kế hoạch thực hiện
└── README.md           # Tài liệu hướng dẫn
```

## 📖 Cách sử dụng

### 1. Giao Task mới
1. Nhấn **"Giao Task Mới"** (nút màu xanh dương).
2. Nhập **Công việc (Objective)** và **Mô tả**.
3. Chọn **Người nhận** và **Deadline**.
4. Hệ thống sẽ **tự động phân tích** và hiển thị:
   - 🎯 **Priority** (P0/P1/P2)
   - 📊 **Difficulty** (Dễ/Trung bình/Khó)
   - 📅 **Số ngày còn lại**
5. Các **Key Results** sẽ được tự động tạo. Bạn có thể sửa hoặc thêm/bớt.
6. Nhấn **"Giao Task"**.

### 2. Theo dõi tiến độ
- Nhấn vào **task card** để xem chi tiết.
- Tick vào **checkbox** của Key Results khi hoàn thành.
- Progress bar sẽ tự động cập nhật.

### 3. AI Assistant
- Nhấn nút **"AI Assistant"** (màu tím) để mở bảng chat.
- Hỏi "Tổng quan workspace" để xem báo cáo.
- Hỏi "Những task P0 nào?" để xem danh sách ưu tiên.

## 🎯 OKR Breakdown Logic

| Keywords trong mô tả | Key Results được tạo |
|---|---|
| "thiết kế", "design" | Research → Wireframe → Implement → Review |
| "API", "tích hợp" | Setup → Implement → Test → Document |
| "sửa lỗi", "bug" | Reproduce → Identify → Fix → Test Regression |
| Mặc định | Research → Plan → Execute → Verify |

## 🔧 Priority Rules

| Điều kiện | Priority |
|---|---|
| Có từ "gấp", "khẩn" | P0 |
| Deadline < 24 giờ | P0 |
| Deadline < 3 ngày | P1 |
| Còn lại | P2 |

## 🌐 Deploy public (GitHub Pages)
1. Push code lên GitHub (branch `main`).
2. Vào GitHub repo → Settings → Pages → Source chọn GitHub Actions.
3. Mỗi lần push lên `main` sẽ tự deploy. URL sẽ là `https://<github-username>.github.io/<repo>/`.

---

Dự án được thực hiện bởi **AI Project Manager** với tinh thần *"All for one, One for all"*.
