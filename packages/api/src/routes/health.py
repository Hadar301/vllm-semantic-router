from fastapi import APIRouter, Request

router = APIRouter(tags=["health"])


@router.get("/healthz")
async def liveness():
    return {"status": "ok"}


@router.get("/readyz")
async def readiness(request: Request):
    client = request.app.state.router_client
    sr_health = await client.health()
    return {"status": "ok", "services": sr_health}
