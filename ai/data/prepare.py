from __future__ import annotations

import json
import os
import random
from dataclasses import asdict
from pathlib import Path
from typing import Iterable

from ai.data.schema import TextRecord
from ai.preprocessing.text import normalize_text


def load_jsonl(path: Path) -> list[TextRecord]:
    """
    Input:
      - path: JSONL file, each line must be {"id": str, "text": str}
    Output:
      - list of validated TextRecord
    """

    records: list[TextRecord] = []
    with path.open("r", encoding="utf-8") as f:
        for idx, line in enumerate(f, start=1):
            raw = line.strip()
            if not raw:
                continue
            try:
                obj = json.loads(raw)
            except json.JSONDecodeError as e:
                raise ValueError(f"Line {idx}: invalid JSON ({e.msg})") from e
            rec = TextRecord.from_json(obj, line_no=idx)
            cleaned = normalize_text(rec.text)
            records.append(TextRecord(id=rec.id, text=cleaned))

    if not records:
        raise ValueError("Dataset is empty after loading/cleaning.")

    return records


def write_jsonl(path: Path, records: Iterable[TextRecord]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for rec in records:
            f.write(json.dumps(asdict(rec), ensure_ascii=False) + "\n")


def compute_stats(records: list[TextRecord]) -> dict:
    lengths = [len(r.text) for r in records]
    return {
        "count": len(records),
        "text_len": {
            "min": min(lengths),
            "max": max(lengths),
            "avg": sum(lengths) / max(1, len(lengths)),
        },
    }


def split_dataset(
    records: list[TextRecord],
    *,
    seed: int,
    train_ratio: float,
    val_ratio: float,
) -> tuple[list[TextRecord], list[TextRecord], list[TextRecord]]:
    if train_ratio <= 0 or val_ratio <= 0 or train_ratio + val_ratio >= 1:
        raise ValueError("Invalid split ratios. Need train>0, val>0, train+val<1.")

    rng = random.Random(seed)
    shuffled = records[:]
    rng.shuffle(shuffled)

    n = len(shuffled)
    n_train = int(n * train_ratio)
    n_val = int(n * val_ratio)
    n_test = n - n_train - n_val

    train = shuffled[:n_train]
    val = shuffled[n_train : n_train + n_val]
    test = shuffled[n_train + n_val :]

    if len(test) != n_test:
        raise RuntimeError("Split size mismatch.")

    return train, val, test


def prepare_dataset(
    *,
    input_jsonl: str,
    output_dir: str,
    seed: int = 42,
    train_ratio: float = 0.8,
    val_ratio: float = 0.1,
    force: bool = False,
) -> dict:
    """
    End-to-end dataset preparation.

    Input:
      - input_jsonl: path to raw JSONL
      - output_dir: destination folder

    Output:
      - stats dict (also written to stats.json)
    """

    in_path = Path(input_jsonl)
    out_dir = Path(output_dir)

    if not in_path.exists():
        raise FileNotFoundError(f"Input not found: {in_path}")

    out_dir.mkdir(parents=True, exist_ok=True)

    out_train = out_dir / "train.jsonl"
    out_val = out_dir / "val.jsonl"
    out_test = out_dir / "test.jsonl"
    out_stats = out_dir / "stats.json"

    if not force and any(p.exists() for p in [out_train, out_val, out_test, out_stats]):
        raise FileExistsError(
            "Output already exists. Use --force to overwrite processed files."
        )

    records = load_jsonl(in_path)
    train, val, test = split_dataset(records, seed=seed, train_ratio=train_ratio, val_ratio=val_ratio)

    write_jsonl(out_train, train)
    write_jsonl(out_val, val)
    write_jsonl(out_test, test)

    stats = {
        "input": {"path": str(in_path), "size_bytes": os.path.getsize(in_path)},
        "seed": seed,
        "ratios": {"train": train_ratio, "val": val_ratio, "test": 1 - train_ratio - val_ratio},
        "counts": {"train": len(train), "val": len(val), "test": len(test), "total": len(records)},
        "train_stats": compute_stats(train),
        "val_stats": compute_stats(val),
        "test_stats": compute_stats(test),
    }

    out_stats.write_text(json.dumps(stats, ensure_ascii=False, indent=2), encoding="utf-8")
    return stats

