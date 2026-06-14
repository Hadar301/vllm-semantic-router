from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

from src.schemas.chat import ChatRequest
from src.services.chat_service import ChatService
from src.services.router_client import RouterClient

router = APIRouter(prefix="/api/v1", tags=["chat"])


def _get_router_client(request: Request) -> RouterClient:
    return request.app.state.router_client


@router.post("/chat")
async def chat(body: ChatRequest, request: Request) -> StreamingResponse:
    client = _get_router_client(request)
    service = ChatService(client)
    return StreamingResponse(
        service.stream_response(body.messages),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
