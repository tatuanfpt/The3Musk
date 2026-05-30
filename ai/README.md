# AI/LLM Pipeline (Viable, Controllable) — 3Musk

Mục tiêu: cung cấp một pipeline huấn luyện/đánh giá/triển khai mô hình ngôn ngữ nhỏ (LLM) theo hướng “industry-standard”, có thể kiểm soát chất lượng bằng test + QC checklist, và có workflow Input → Processing → Output rõ ràng.

## Cấu trúc thư mục

- `ai/data/`
  - `raw/`: dữ liệu thô (JSONL)
  - `processed/`: dữ liệu sau tiền xử lý + chia tập
  - `schema.py`: schema record đầu vào
  - `prepare.py`: làm sạch/chuẩn hoá/chia train/val/test
- `ai/preprocessing/`
  - `text.py`: rule-based cleaning/normalization
- `ai/model/`
  - `loader.py`: load model/tokenizer (mặc định tiny model để chạy nhanh)
- `ai/training/`
  - `train.py`: huấn luyện + checkpoint + resume
- `ai/evaluation/`
  - `evaluate.py`: perplexity + sanity checks + latency benchmark
- `ai/serving/`
  - `app.py`: FastAPI server `/healthz`, `/generate`
- `ai/tests/`
  - unit/integration tests
- `ai/docs/`
  - `ARCHITECTURE.md`: mô tả module I/O + luồng workflow
  - `QC_TESTS.md`: kịch bản QC chi tiết
- `ai/cli.py`
  - entrypoint orchestration (workflow runner)

## Workflow nhanh (Input → Processing → Output)

1. Prepare data

```bash
python -m ai.cli prepare-data --in ai/data/raw/sample.jsonl --out ai/data/processed
```

2. Train

```bash
python -m ai.cli train --data ai/data/processed --out ai/artifacts/model
```

3. Evaluate

```bash
python -m ai.cli evaluate --data ai/data/processed --model ai/artifacts/model
```

4. Serve

```bash
python -m ai.cli serve --model ai/artifacts/model --host 127.0.0.1 --port 8080
```

## Yêu cầu môi trường (tối thiểu)

Xem `ai/requirements.txt`.
