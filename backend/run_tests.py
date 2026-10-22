"""
NutriZero AI - Direct Backend Test Runner
Runs tests using FastAPI TestClient and prints clear diagnostics.
"""

import sys
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def run_all_tests():
    passed = 0
    failed = 0

    tests = [
        ("GET /health", test_health),
        ("GET /api/gemini-status", test_gemini_status),
        ("GET /api/nutrition-data", test_nutrition_data),
        ("GET /api/sdg-info", test_sdg_info),
        ("GET /api/food-storage", test_food_storage),
        ("POST /api/chat (empty validation)", test_chat_validation),
        ("POST /api/chat (real Gemini request)", test_chat_gemini),
        ("POST /api/recipe-from-image (Gemini Vision)", test_recipe_from_image),
    ]

    print("========================================")
    print("🧪 Running NutriZero AI Backend Tests")
    print("========================================")

    for name, test_func in tests:
        try:
            test_func()
            print(f"✅ PASS: {name}")
            passed += 1
        except Exception as e:
            print(f"❌ FAIL: {name} - Error: {e}")
            failed += 1

    print("========================================")
    print(f"Summary: {passed} passed, {failed} failed")
    print("========================================")
    if failed > 0:
        sys.exit(1)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    assert res.json() == {"status": "ok"}

def test_gemini_status():
    res = client.get("/api/gemini-status")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert data.get("connected") is True, f"Expected connected=True, got {data}"

def test_nutrition_data():
    res = client.get("/api/nutrition-data")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert len(data.get("staples", [])) >= 5

def test_sdg_info():
    res = client.get("/api/sdg-info")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert "pillars" in data

def test_food_storage():
    res = client.get("/api/food-storage")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert len(data.get("guidelines", [])) >= 4

def test_chat_validation():
    res = client.post("/api/chat", json={"message": "   "})
    assert res.status_code in [400, 422], f"Expected 400 or 422, got {res.status_code}"

def test_chat_gemini():
    res = client.post("/api/chat", json={"message": "What is SDG 2?"})
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert "reply" in data, f"Missing reply in {data}"
    assert len(data["reply"]) > 15, "Reply too short"

def test_recipe_from_image():
    pixel_b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
    res = client.post("/api/recipe-from-image", json={"image": pixel_b64, "prompt": "Identify and give budget recipe"})
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert "reply" in data, f"Missing reply in {data}"
    assert len(data["reply"]) > 15, "Reply too short"

if __name__ == "__main__":
    run_all_tests()
