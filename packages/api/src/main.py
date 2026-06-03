from fastapi import FastAPI

app = FastAPI(title="vLLM Semantic Router API", version="0.1.0")


@app.get("/healthz")
async def health():
    return {"status": "ok"}
