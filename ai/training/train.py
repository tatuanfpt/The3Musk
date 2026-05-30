from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from datasets import load_dataset
from transformers import DataCollatorForLanguageModeling, Trainer, TrainingArguments

from ai.model.loader import load_causal_lm


@dataclass(frozen=True)
class TrainConfig:
    """
    Training configuration.

    Input:
      - model_id: HF model id or local path
      - max_steps: number of update steps
      - learning_rate: optimizer LR
      - per_device_batch_size: batch size per device
      - save_every: save checkpoint every N steps
      - seed: RNG seed
    """

    model_id: str = "sshleifer/tiny-gpt2"
    max_steps: int = 50
    learning_rate: float = 5e-4
    per_device_batch_size: int = 2
    save_every: int = 25
    seed: int = 42


def train(
    *,
    data_dir: str,
    out_dir: str,
    cfg: TrainConfig,
    force: bool = False,
) -> dict:
    """
    Train a tiny causal LM with checkpointing.

    Input:
      - data_dir: folder containing train.jsonl/val.jsonl
      - out_dir: artifact folder (model + checkpoints)

    Output:
      - training metrics dict (also written to train_metrics.json)
    """

    data_path = Path(data_dir)
    out_path = Path(out_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    train_file = data_path / "train.jsonl"
    val_file = data_path / "val.jsonl"
    if not train_file.exists() or not val_file.exists():
        raise FileNotFoundError("Missing train.jsonl/val.jsonl in processed data dir.")

    train_metrics_path = out_path / "train_metrics.json"
    if train_metrics_path.exists() and not force:
        raise FileExistsError("Output already exists. Use --force to overwrite.")

    loaded = load_causal_lm(cfg.model_id)
    tokenizer = loaded.tokenizer
    model = loaded.model

    ds = load_dataset(
        "json",
        data_files={"train": str(train_file), "validation": str(val_file)},
    )

    def tokenize_fn(batch: dict) -> dict:
        return tokenizer(
            batch["text"],
            truncation=True,
            max_length=256,
            padding=False,
        )

    tokenized = ds.map(tokenize_fn, batched=True, remove_columns=ds["train"].column_names)

    data_collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)

    training_args = TrainingArguments(
        output_dir=str(out_path / "checkpoints"),
        overwrite_output_dir=True,
        max_steps=cfg.max_steps,
        learning_rate=cfg.learning_rate,
        per_device_train_batch_size=cfg.per_device_batch_size,
        per_device_eval_batch_size=cfg.per_device_batch_size,
        evaluation_strategy="steps",
        eval_steps=max(1, cfg.save_every),
        save_steps=max(1, cfg.save_every),
        save_total_limit=3,
        logging_steps=5,
        seed=cfg.seed,
        report_to=[],
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized["train"],
        eval_dataset=tokenized["validation"],
        data_collator=data_collator,
        tokenizer=tokenizer,
    )

    resume_from = str(out_path / "checkpoints") if (out_path / "checkpoints").exists() else None
    train_result = trainer.train(resume_from_checkpoint=resume_from)

    trainer.save_model(str(out_path))
    tokenizer.save_pretrained(str(out_path))

    metrics = {
        "train_runtime": train_result.metrics.get("train_runtime"),
        "train_samples_per_second": train_result.metrics.get("train_samples_per_second"),
        "train_steps_per_second": train_result.metrics.get("train_steps_per_second"),
        "global_step": int(train_result.metrics.get("global_step", cfg.max_steps)),
    }

    train_metrics_path.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    return metrics

