from pathlib import Path

from ai.data.prepare import load_jsonl, split_dataset


def test_load_jsonl_and_split(tmp_path: Path):
    raw = tmp_path / "raw.jsonl"
    raw.write_text(
        "\n".join(
            [
                '{"id":"1","text":"a"}',
                '{"id":"2","text":"b"}',
                '{"id":"3","text":"c"}',
                '{"id":"4","text":"d"}',
                '{"id":"5","text":"e"}',
                "",
            ]
        ),
        encoding="utf-8",
    )

    records = load_jsonl(raw)
    train, val, test = split_dataset(records, seed=42, train_ratio=0.6, val_ratio=0.2)

    assert len(train) + len(val) + len(test) == len(records)
    assert len(train) > 0
    assert len(val) > 0
    assert len(test) > 0

