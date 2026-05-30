# QC Test Suite — AI/LLM Pipeline

Mục tiêu: kiểm soát chất lượng theo 4 nhóm: dữ liệu, huấn luyện, đánh giá, triển khai. Mỗi test case gồm: mục đích, bước, input, expected/acceptance.

## QC-01 — Data schema validation
**Mục đích**: đảm bảo dữ liệu raw đúng schema JSONL.

**Bước**
1. Chuẩn bị file `ai/data/raw/sample.jsonl` (hoặc dataset thật).
2. Chạy:
   - `python -m ai.cli prepare-data --in ai/data/raw/sample.jsonl --out ai/data/processed`

**Input**
- JSONL mỗi dòng:
  - `{"id": "...", "text": "..."}`

**Expected / Acceptance**
- Không crash
- Nếu record sai schema: dừng với error message chỉ rõ dòng lỗi

## QC-02 — Data split ratios
**Mục đích**: xác minh chia train/val/test đúng tỉ lệ.

**Bước**
1. Chạy prepare-data như QC-01.
2. Mở `ai/data/processed/stats.json`.

**Expected / Acceptance**
- Có trường `counts.train`, `counts.val`, `counts.test`
- Tổng bằng số record đầu vào
- Sai lệch tỉ lệ không quá 1 record do rounding

## QC-03 — Training smoke test (tiny model)
**Mục đích**: đảm bảo train loop chạy được end-to-end (viable).

**Bước**
1. Chạy prepare-data.
2. Chạy:
   - `python -m ai.cli train --data ai/data/processed --out ai/artifacts/model --max-steps 20`

**Expected / Acceptance**
- Sinh ra thư mục `ai/artifacts/model`
- Có `train_metrics.json`
- Không có exception unhandled

## QC-04 — Checkpoint & resume
**Mục đích**: kiểm tra checkpointing + resume ổn định.

**Bước**
1. Train `--max-steps 30 --save-every 10`.
2. Dừng giữa chừng (Ctrl+C).
3. Chạy lại train với cùng output folder.

**Expected / Acceptance**
- Tool detect checkpoint và resume
- Không tạo artifacts hỏng/thiếu file

## QC-05 — Evaluation metrics exist
**Mục đích**: đảm bảo pipeline đánh giá tạo output chuẩn.

**Bước**
1. Sau khi train, chạy:
   - `python -m ai.cli evaluate --data ai/data/processed --model ai/artifacts/model`

**Expected / Acceptance**
- Có `ai/artifacts/model/eval_metrics.json`
- Có keys: `perplexity`, `latency_ms_p50`, `latency_ms_p95`

## QC-06 — Serving healthcheck
**Mục đích**: đảm bảo service deploy chạy và healthcheck ok.

**Bước**
1. Chạy:
   - `python -m ai.cli serve --model ai/artifacts/model --host 127.0.0.1 --port 8080`
2. Mở:
   - `GET http://127.0.0.1:8080/healthz`

**Expected / Acceptance**
- HTTP 200
- body JSON có `status=ok`

## QC-07 — Serving generate endpoint (functional)
**Mục đích**: đảm bảo `/generate` trả output hợp lệ, không timeout.

**Bước**
1. Gửi request:
   - `POST /generate`
   - body: `{"prompt":"Hello","max_new_tokens":16,"temperature":0.7}`

**Expected / Acceptance**
- HTTP 200
- JSON có `text` (string, length > len(prompt))
- Thời gian phản hồi < 2s (tiny model, CPU)

## QC-08 — Agent workflow I/O trace
**Mục đích**: đảm bảo CLI tạo trace input/processing/output rõ ràng.

**Bước**
1. Chạy:
   - `python -m ai.cli workflow --step prepare-data ...`

**Expected / Acceptance**
- Console log hiển thị 3 phần: Input / Processing / Output
- Khi lỗi: có nguyên nhân + hướng dẫn khắc phục

## QC-09 — Robustness: bad import file
**Mục đích**: đảm bảo pipeline fail-fast khi file input không hợp lệ.

**Bước**
1. Tạo file raw JSONL bị thiếu field `text`.
2. Chạy prepare-data.

**Expected / Acceptance**
- Dừng với message “missing text” và index dòng

## QC-10 — Load/latency regression gate
**Mục đích**: kiểm soát regressions latency.

**Bước**
1. Chạy evaluate.
2. So sánh `latency_ms_p95` với baseline.

**Expected / Acceptance**
- Nếu p95 tăng > 30% so baseline: fail QC, cần điều tra.

