# Kiến trúc AI/LLM Pipeline (Input → Processing → Output)

## 1) Mục tiêu
- Có cấu trúc code rõ ràng theo module (data/preprocess/model/train/eval/serve/tests/docs).
- Có workflow ổn định, xử lý lỗi hợp lý, output chuẩn hoá để QC được.
- Viable: chạy được với “tiny model” để demo nhanh, có checkpoint, có serve API.

## 2) Luồng tổng thể

### (A) Prepare Data
**Input**
- `ai/data/raw/*.jsonl` (mỗi dòng 1 record)

**Processing**
- Validate schema
- Clean/normalize text
- Split train/val/test (mặc định 80/10/10) với random seed
- Report thống kê cơ bản (count, avg length)

**Output**
- `ai/data/processed/train.jsonl`
- `ai/data/processed/val.jsonl`
- `ai/data/processed/test.jsonl`
- `ai/data/processed/stats.json`

### (B) Train
**Input**
- processed dataset folder
- model id (mặc định `sshleifer/tiny-gpt2`)
- training config

**Processing**
- Tokenize
- Train loop với checkpoint định kỳ
- Resume từ checkpoint nếu có

**Output**
- `ai/artifacts/model/` (model + tokenizer + config)
- `ai/artifacts/model/checkpoints/*`
- `ai/artifacts/model/train_metrics.json`

### (C) Evaluate
**Input**
- model folder
- test set

**Processing**
- Compute perplexity (approx)
- Sanity checks (generate sample)
- Latency benchmark (CPU)

**Output**
- `ai/artifacts/model/eval_metrics.json`

### (D) Serve
**Input**
- model folder

**Processing**
- Load model/tokenizer
- Expose endpoints

**Output**
- HTTP service:
  - `GET /healthz`
  - `POST /generate` {prompt, max_new_tokens, temperature}

## 3) Error handling (nguyên tắc)
- Tất cả CLI command phải:
  - validate input path
  - fail-fast với message rõ ràng
  - không ghi đè artifacts trừ khi `--force`

## 4) Tích hợp Trae (workflow vận hành)
- Dùng Trae để:
  - generate/refresh data prompt templates
  - chạy lệnh pipeline theo từng bước (prepare/train/eval/serve)
  - ghi nhận kết quả benchmark + QC checklist

