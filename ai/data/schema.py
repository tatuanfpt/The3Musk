from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class TextRecord:
    """
    A single training example for language modeling.

    Input:
      - id: stable identifier (string)
      - text: training text (string)

    Output:
      - validated TextRecord instance
    """

    id: str
    text: str

    @staticmethod
    def from_json(obj: dict, *, line_no: int) -> "TextRecord":
        if not isinstance(obj, dict):
            raise ValueError(f"Line {line_no}: record must be an object")

        rid = obj.get("id")
        text = obj.get("text")

        if not isinstance(rid, str) or not rid.strip():
            raise ValueError(f"Line {line_no}: missing/invalid 'id' (string)")

        if not isinstance(text, str) or not text.strip():
            raise ValueError(f"Line {line_no}: missing/invalid 'text' (string)")

        return TextRecord(id=rid.strip(), text=text)

