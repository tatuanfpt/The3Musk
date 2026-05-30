from __future__ import annotations

import re


def normalize_text(text: str) -> str:
    """
    Normalize training text with lightweight, rule-based cleanup.

    Input:
      - text: raw string

    Processing:
      - normalize newlines
      - collapse excessive whitespace
      - trim

    Output:
      - cleaned string
    """

    value = str(text).replace("\r\n", "\n").replace("\r", "\n")
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()

