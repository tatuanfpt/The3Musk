from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from ai.model.loader import load_causal_lm


class GenerateRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=2000)
    max_new_tokens: int = Field(default=64, ge=1, le=256)
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)


class GenerateResponse(BaseModel):
    text: str


@dataclass
class ServingState:
    model_dir: str
    model: Optional[object] = None
    tokenizer: Optional[object] = None
    device: str = "cpu"


def create_app(*, model_dir: str) -> FastAPI:
    app = FastAPI(title="3Musk AI/LLM Service", version="0.1.0")
    state = ServingState(model_dir=model_dir)

    @app.on_event("startup")
    def _startup() -> None:
        loaded = load_causal_lm(model_dir)
        state.tokenizer = loaded.tokenizer
        state.model = loaded.model
        state.device = "cuda" if torch.cuda.is_available() else "cpu"
        state.model.to(state.device)
        state.model.eval()

    @app.get("/healthz")
    def healthz() -> dict:
        return {"status": "ok", "device": state.device}

    @app.post("/generate", response_model=GenerateResponse)
    @torch.no_grad()
    def generate(req: GenerateRequest) -> GenerateResponse:
        if state.model is None or state.tokenizer is None:
            raise HTTPException(status_code=503, detail="Model not loaded yet")

        enc = state.tokenizer(req.prompt, return_tensors="pt").to(state.device)
        out = state.model.generate(
            **enc,
            max_new_tokens=req.max_new_tokens,
            do_sample=req.temperature > 0,
            temperature=req.temperature if req.temperature > 0 else 1.0,
            pad_token_id=state.tokenizer.eos_token_id,
        )
        text = state.tokenizer.decode(out[0], skip_special_tokens=True)
        return GenerateResponse(text=text)

    return app

