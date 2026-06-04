from __future__ import annotations

import json
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import httpx

from src.schemas.chat import RoutingMetadata


class RouterClient:
    def __init__(self, envoy_url: str, api_url: str) -> None:
        self._envoy_url = envoy_url.rstrip("/")
        self._api_url = api_url.rstrip("/")
        self._client = httpx.AsyncClient(timeout=httpx.Timeout(300.0))

    async def eval(self, text: str) -> RoutingMetadata:
        response = await self._client.post(
            f"{self._api_url}/api/v1/eval",
            json={"text": text, "options": {"return_probabilities": True}},
        )
        response.raise_for_status()
        return RoutingMetadata.from_eval_response(response.json())

    @asynccontextmanager
    async def stream_chat(self, message: str) -> AsyncIterator[httpx.Response]:
        body = {
            "model": "auto",
            "messages": [{"role": "user", "content": message}],
            "stream": True,
        }
        async with self._client.stream(
            "POST",
            f"{self._envoy_url}/v1/chat/completions",
            json=body,
        ) as response:
            response.raise_for_status()
            yield response

    async def health(self) -> dict:
        try:
            resp = await self._client.get(f"{self._api_url}/health", timeout=5.0)
            return {"semantic_router": resp.json()}
        except Exception as exc:
            return {"semantic_router": {"status": "error", "detail": str(exc)}}

    async def close(self) -> None:
        await self._client.aclose()


def parse_sse_content(line: str) -> str | None:
    """Extract delta content from an OpenAI-format SSE data line."""
    if not line.startswith("data: "):
        return None
    payload = line[6:]
    if payload.strip() == "[DONE]":
        return None
    try:
        chunk = json.loads(payload)
        choices = chunk.get("choices", [])
        if choices:
            return choices[0].get("delta", {}).get("content")
    except json.JSONDecodeError:
        pass
    return None


def is_done_line(line: str) -> bool:
    return line.strip() == "data: [DONE]"
