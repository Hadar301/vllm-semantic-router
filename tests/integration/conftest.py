import os

import pytest


@pytest.fixture
def database_url():
    return os.getenv("DATABASE_URL", "postgresql://postgres:test@localhost:5432/test")
