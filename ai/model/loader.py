from __future__ import annotations

from dataclasses import dataclass

from transformers import AutoModelForCausalLM, AutoTokenizer


@dataclass(frozen=True)
class LoadedModel:
    """
    Container for a causal language model + tokenizer.

    Input:
      - model_id_or_path: HF model id or local path

    Output:
      - model, tokenizer ready for generate/train
    """

    model: object
    tokenizer: object


def load_causal_lm(model_id_or_path: str) -> LoadedModel:
    tokenizer = AutoTokenizer.from_pretrained(model_id_or_path, use_fast=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(model_id_or_path)
    return LoadedModel(model=model, tokenizer=tokenizer)

