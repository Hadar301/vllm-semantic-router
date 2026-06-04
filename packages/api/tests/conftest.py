from unittest.mock import AsyncMock

import pytest
from httpx import ASGITransport, AsyncClient

from src.main import app
from src.schemas.chat import RoutingMetadata
from src.services.router_client import RouterClient


@pytest.fixture
def mock_router_client():
    client = AsyncMock(spec=RouterClient)
    client.health.return_value = {"semantic_router": {"status": "ok"}}
    client.eval.return_value = RoutingMetadata(
        selected_model="general-agent",
        selected_decision="general",
        selected_confidence=0.85,
        signal_confidences={"domain:general": 0.85},
        routing_decision="general",
    )
    return client


@pytest.fixture
async def client(mock_router_client):
    app.state.router_client = mock_router_client
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
