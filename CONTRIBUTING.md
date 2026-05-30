# Contributing & Git Rules

## Vấn đề “scattered / phân mảnh” là gì?
Khi nhiều người cùng làm nhưng không đồng bộ từ cùng một “nguồn chuẩn” (trunk), lịch sử commit sẽ bị diverge (mỗi người có một tuyến commit riêng). Kết quả thường gặp:
- Merge conflict kiểu `add/add` ở cùng tên file
- Xuất hiện các commit “không cùng gốc” (unrelated histories)
- Team không chắc “main mới nhất” thực sự là tuyến nào

## Rule phổ biến để tránh phân mảnh
### “Don’t rewrite shared history”
Không được viết lại lịch sử của nhánh đã chia sẻ cho người khác (đặc biệt là `main`). Nghĩa là:
- Không `git push --force` lên `main`
- Không `git rebase` lên `main` (trừ khi làm trên local và chưa push)

## Quy trình khuyến nghị (trunk-based development)
1) `main` là nguồn chuẩn duy nhất (trunk) và luôn ở trạng thái chạy được.
2) Mỗi tính năng làm trên nhánh ngắn hạn:
   - Tạo branch từ `origin/main` mới nhất
   - PR/MR về `main` càng sớm càng tốt
3) Đồng bộ liên tục để tránh diverge:
   - Trước khi bắt đầu làm việc: `git fetch` + `git pull --rebase origin main`
   - Nếu branch sống lâu, thường xuyên rebase lên `origin/main` (trên branch của mình, không phải `main`)
4) Merge vào `main` chỉ qua PR/MR:
   - Tối thiểu 1 người review
   - CI xanh (nếu có)

## Cấu hình bắt buộc (đề xuất)
### Bật protected branch cho `main`
Trên GitHub: Settings → Branches → Add rule cho `main`:
- Require a pull request before merging
- Require approvals (>= 1)
- Require status checks (nếu có CI)
- Restrict who can push to matching branches (optional)
- Tắt “Allow force pushes”

## Quick commands (team)
### Bắt đầu task mới
```bash
git checkout main
git fetch origin
git pull --rebase origin main
git checkout -b feat/<short-name>
```

### Trước khi mở PR
```bash
git fetch origin
git rebase origin/main
```

