from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict

from ai.data.prepare import prepare_dataset


def _print_block(title: str, payload: object) -> None:
    print(f"{title}:")
    if isinstance(payload, str):
        print(payload)
        return
    print(json.dumps(payload, ensure_ascii=False, indent=2))


def cmd_prepare_data(args: argparse.Namespace) -> int:
    _print_block("Input", {"in": args.in_path, "out": args.out_dir})
    _print_block(
        "Processing",
        {
            "step": "prepare-data",
            "seed": args.seed,
            "ratios": {"train": args.train_ratio, "val": args.val_ratio},
            "force": args.force,
        },
    )
    stats = prepare_dataset(
        input_jsonl=args.in_path,
        output_dir=args.out_dir,
        seed=args.seed,
        train_ratio=args.train_ratio,
        val_ratio=args.val_ratio,
        force=args.force,
    )
    _print_block("Output", {"processed_dir": args.out_dir, "stats": stats["counts"]})
    return 0


def cmd_train(args: argparse.Namespace) -> int:
    from ai.training.train import TrainConfig, train

    cfg = TrainConfig(
        model_id=args.model_id,
        max_steps=args.max_steps,
        learning_rate=args.learning_rate,
        per_device_batch_size=args.batch_size,
        save_every=args.save_every,
        seed=args.seed,
    )
    _print_block("Input", {"data_dir": args.data_dir, "out_dir": args.out_dir})
    _print_block("Processing", {"step": "train", **asdict(cfg), "force": args.force})
    metrics = train(data_dir=args.data_dir, out_dir=args.out_dir, cfg=cfg, force=args.force)
    _print_block("Output", {"model_dir": args.out_dir, "metrics": metrics})
    return 0


def cmd_evaluate(args: argparse.Namespace) -> int:
    from ai.evaluation.evaluate import EvalConfig, evaluate

    cfg = EvalConfig(max_eval_samples=args.max_eval_samples, max_new_tokens=args.max_new_tokens)
    _print_block("Input", {"data_dir": args.data_dir, "model_dir": args.model_dir})
    _print_block("Processing", {"step": "evaluate", **asdict(cfg)})
    metrics = evaluate(data_dir=args.data_dir, model_dir=args.model_dir, cfg=cfg)
    _print_block("Output", {"eval_metrics_path": f"{args.model_dir}/eval_metrics.json", "metrics": metrics})
    return 0


def cmd_serve(args: argparse.Namespace) -> int:
    import uvicorn

    from ai.serving.app import create_app

    _print_block("Input", {"model_dir": args.model_dir})
    _print_block("Processing", {"step": "serve", "host": args.host, "port": args.port})
    app = create_app(model_dir=args.model_dir)
    _print_block("Output", {"url": f"http://{args.host}:{args.port}", "healthz": "/healthz", "generate": "/generate"})
    uvicorn.run(app, host=args.host, port=args.port, log_level="info")
    return 0


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="python -m ai.cli", add_help=True)
    sub = p.add_subparsers(dest="cmd", required=True)

    p_prep = sub.add_parser("prepare-data")
    p_prep.add_argument("--in", dest="in_path", required=True)
    p_prep.add_argument("--out", dest="out_dir", required=True)
    p_prep.add_argument("--seed", type=int, default=42)
    p_prep.add_argument("--train-ratio", type=float, default=0.8)
    p_prep.add_argument("--val-ratio", type=float, default=0.1)
    p_prep.add_argument("--force", action="store_true")
    p_prep.set_defaults(fn=cmd_prepare_data)

    p_train = sub.add_parser("train")
    p_train.add_argument("--data", dest="data_dir", required=True)
    p_train.add_argument("--out", dest="out_dir", required=True)
    p_train.add_argument("--model-id", default="sshleifer/tiny-gpt2")
    p_train.add_argument("--max-steps", type=int, default=50)
    p_train.add_argument("--save-every", type=int, default=25)
    p_train.add_argument("--learning-rate", type=float, default=5e-4)
    p_train.add_argument("--batch-size", type=int, default=2)
    p_train.add_argument("--seed", type=int, default=42)
    p_train.add_argument("--force", action="store_true")
    p_train.set_defaults(fn=cmd_train)

    p_eval = sub.add_parser("evaluate")
    p_eval.add_argument("--data", dest="data_dir", required=True)
    p_eval.add_argument("--model", dest="model_dir", required=True)
    p_eval.add_argument("--max-eval-samples", type=int, default=64)
    p_eval.add_argument("--max-new-tokens", type=int, default=32)
    p_eval.set_defaults(fn=cmd_evaluate)

    p_serve = sub.add_parser("serve")
    p_serve.add_argument("--model", dest="model_dir", required=True)
    p_serve.add_argument("--host", default="127.0.0.1")
    p_serve.add_argument("--port", type=int, default=8080)
    p_serve.set_defaults(fn=cmd_serve)

    return p


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        return int(args.fn(args))
    except Exception as e:
        _print_block(
            "Output",
            {
                "status": "error",
                "message": str(e),
                "hint": "Xem ai/docs/QC_TESTS.md và ai/docs/ARCHITECTURE.md để debug theo bước.",
            },
        )
        return 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))

