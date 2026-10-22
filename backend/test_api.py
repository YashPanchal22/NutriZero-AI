"""
NutriZero AI - Backend Automated Tests
Tests FastAPI endpoints: /health, /api/gemini-status, /api/chat, /api/recipe, /api/nutrition-data, /api/sdg-info
"""

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    """Verify standard health check returns status ok"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data == {"status": "ok"}

def test_gemini_status():
    """Verify gemini status endpoint returns connection information without key exposure"""
    response = client.get("/api/gemini-status")
    assert response.status_code == 200
    data = response.json()
    assert "connected" in data
    assert data.get("provider") == "Google Gemini"
    # Verify no secret key is exposed in the output
    assert "AIza" not in str(data)
    assert "key" not in data or data.get("key") is None

def test_nutrition_data():
    """Verify nutrition data endpoint returns baseline staples"""
    response = client.get("/api/nutrition-data")
    assert response.status_code == 200
    data = response.json()
    assert "staples" in data
    assert len(data["staples"]) >= 5
    # Verify staple structure
    sample = data["staples"][0]
    assert "name" in sample
    assert "calories" in sample
    assert "protein" in sample

def test_sdg_info():
    """Verify SDG 2 educational endpoint returns pillars and targets"""
    response = client.get("/api/sdg-info")
    assert response.status_code == 200
    data = response.json()
    assert "pillars" in data
    assert len(data["pillars"]) == 4
    assert "keyTargets" in data

def test_food_storage():
    """Verify storage guidelines endpoint returns practical items"""
    response = client.get("/api/food-storage")
    assert response.status_code == 200
    data = response.json()
    assert "guidelines" in data
    assert len(data["guidelines"]) >= 4

def test_chat_endpoint_valid():
    """Verify chat endpoint responds with a real reply or graceful response"""
    response = client.post(
        "/api/chat",
        json={"message": "What is SDG 2?"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert len(data["reply"]) > 10

def test_chat_endpoint_empty():
    """Verify chat endpoint rejects empty messages"""
    response = client.post(
        "/api/chat",
        json={"message": "   "}
    )
    # Pydantic or custom validation error
    assert response.status_code in [400, 422]

def test_recipe_from_image():
    """Verify photo recipe endpoint accepts base64 image and responds with recipe"""
    pixel_b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
    response = client.post(
        "/api/recipe-from-image",
        json={"image": pixel_b64, "prompt": "Identify ingredients and suggest a budget recipe."}
    )
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert len(data["reply"]) > 10

