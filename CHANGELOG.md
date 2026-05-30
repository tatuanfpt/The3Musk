# Changelog

## [Unreleased]

## [0.2.1] - 2026-05-30

### Fixed
- Mở Review Modal ổn định khi bấm nút Review trên card task.
- Đồng bộ cập nhật trạng thái khi dùng thao tác prev/next nội bộ (nếu còn được gọi ở nơi khác).

### Added
- Thuộc tính task: Mức ưu tiên, Tiến độ, Mức độ phức tạp (xem/sửa trong Task Modal và Review Modal).
- Panel Sắp xếp & Lọc Task: lọc theo từ khóa/ưu tiên/tiến độ/phức tạp; sắp xếp theo 1–3 tiêu chí.
- Xếp hạng theo Điểm (weighted sum) và cho phép chọn tiêu chí Điểm trong sắp xếp.
- Hiển thị Điểm + badges thuộc tính trên card task và trong Task Detail.

### Changed
- Logic hoàn thành: không cho phép set task sang Done nếu chưa có kết quả review/approve; hệ thống tự giữ task ở Review trong trường hợp cố gắng bypass.

