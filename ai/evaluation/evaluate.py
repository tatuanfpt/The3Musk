from __future__ import annotations

import json
import time
from dataclasses import dataclass
from math import exp
from pathlib import Path

import numpy as np
import torch
from datasets import load_dataset

from ai.model.loader import load_causal_lm


@dataclass(frozen=True)
class EvalConfig:
    """
    Evaluation configuration.

    Input:
      - max_eval_samples: cap samples for fast eval
      - max_new_tokens: generation length for sanity check + latency
    """

    max_eval_samples: int = 64
    max_new_tokens: int = 32


@torch.no_grad()
def compute_perplexity(model, tokenizer, texts: list[str], *, device: str) -> float:
    model.eval()
    model.to(device)

    losses: list[float] = []
    for t in texts:
        enc = tokenizer(t, return_tensors="pt", truncation=True, max_length=256)
        enc = {k: v.to(device) for k, v in enc.items()}
        out = model(**enc, labels=enc["input_ids"])
        losses.append(float(out.loss.detach().cpu().item()))

    mean_loss = float(np.mean(losses)) if losses else 0.0
    return float(exp(mean_loss)) if mean_loss > 0 else float("inf")


@torch.no_grad()
def latency_benchmark(model, tokenizer, *, device: str, prompt: str, max_new_tokens: int) -> dict:
    model.eval()
    model.to(device)

    enc = tokenizer(prompt, return_tensors="pt").to(device)

    timings: list[float] = []
    for _ in range(10):
        start = time.perf_counter()
        _ = model.generate(
            **enc,
            max_new_tokens=max_new_tokens,
            do_sample=True,
            temperature=0.7,
            pad_token_id=tokenizer.eos_token_id,
        )
        end = time.perf_counter()
        timings.append((end - start) * 1000)

    return {
        "latency_ms_p50": float(np.percentile(timings, 50)),
        "latency_ms_p95": float(np.percentile(timings, 95)),
    }


@torch.no_grad()
def generate_sanity(model, tokenizer, *, device: str, prompt: str, max_new_tokens: int) -> str:
    model.eval()
    model.to(device)

    enc = tokenizer(prompt, return_tensors="pt").to(device)
    out = model.generate(
        **enc,
        max_new_tokens=max_new_tokens,
        do_sample=True,
        temperature=0.7,
        pad_token_id=tokenizer.eos_token_id,
    )
    return tokenizer.decode(out[0], skip_special_tokens=True)


def evaluate(
    *,
    data_dir: str,
    model_dir: str,
    cfg: EvalConfig,
) -> dict:
    """
    Evaluate model on test.jsonl and export eval_metrics.json.

    Input:
      - data_dir: folder contains test.jsonl
      - model_dir: trained model folder

    Output:
      - eval metrics dict
    """

    data_path = Path(data_dir)
    test_file = data_path / "test.jsonl"
    if not test_file.exists():
        raise FileNotFoundError("Missing test.jsonl in processed data dir.")

    model_path = Path(model_dir)
    if not model_path.exists():
        raise FileNotFoundError("Model folder not found.")

    loaded = load_causal_lm(str(model_path))
    model = loaded.model
    tokenizer = loaded.tokenizer

    device = "cuda" if torch.cuda.is_available() else "cpu"

    ds = load_dataset("json", data_files={"test": str(test_file)})
    texts = [r["text"] for r in ds["test"][: cfg.max_eval_samples]]

    ppl = compute_perplexity(model, tokenizer, texts, device=device)
    latency = latency_benchmark(
        model,
        tokenizer,
        device=device,
        prompt="Hello, today I will",
        max_new_tokens=cfg.max_new_tokens,
    )
    sample = generate_sanity(
        model,
        tokenizer,
        device=device,
        prompt="Hello, today I will",
        max_new_tokens=cfg.max_new_tokens,
    )

    metrics = {
        "device": device,
        "perplexity": ppl,
        **latency,
        "sample": sample,
    }

    out_path = model_path / "eval_metrics.json"
    out_path.write_text(json.dumps(metrics, ensure_ascii=False, indent=2), encoding="utf-8")
    return metrics

