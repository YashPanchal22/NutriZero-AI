"""
NutriZero AI - Verify all specialized tool endpoints
"""

import requests

BASE = "http://localhost:8000"

def test_endpoints():
    print("Testing specialized endpoints...")

    # 1. Pantry Chef Recipe
    r1 = requests.post(f"{BASE}/api/recipe", json={"ingredients": ["Rice", "Dal", "Onion", "Potato"]})
    assert r1.status_code == 200, f"Recipe failed: {r1.text}"
    print("✅ /api/recipe working! Result length:", len(r1.json().get("reply", "")))

    # 2. Meal Planner
    r2 = requests.post(f"{BASE}/api/meal-plan", json={"budget": "₹150", "people": 2, "diet": "Vegetarian"})
    assert r2.status_code == 200, f"Meal plan failed: {r2.text}"
    print("✅ /api/meal-plan working! Result length:", len(r2.json().get("reply", "")))

    # 3. Food Waste Reducer
    r3 = requests.post(f"{BASE}/api/food-waste", json={"leftover": "leftover rice"})
    assert r3.status_code == 200, f"Food waste failed: {r3.text}"
    print("✅ /api/food-waste working! Result length:", len(r3.json().get("reply", "")))

    # 4. Grocery Planner
    r4 = requests.post(f"{BASE}/api/grocery-plan", json={"budget": "₹500", "people": 2, "preferences": "Staples"})
    assert r4.status_code == 200, f"Grocery plan failed: {r4.text}"
    print("✅ /api/grocery-plan working! Result length:", len(r4.json().get("reply", "")))

    # 5. Food Storage Guidelines
    r5 = requests.get(f"{BASE}/api/food-storage")
    assert r5.status_code == 200 and len(r5.json().get("guidelines", [])) >= 5
    print("✅ /api/food-storage working! Guidelines count:", len(r5.json().get("guidelines", [])))

    # 6. Nutrition Data
    r6 = requests.get(f"{BASE}/api/nutrition-data")
    assert r6.status_code == 200 and len(r6.json().get("staples", [])) >= 5
    print("✅ /api/nutrition-data working! Staples count:", len(r6.json().get("staples", [])))

    # 7. SDG Info
    r7 = requests.get(f"{BASE}/api/sdg-info")
    assert r7.status_code == 200 and len(r7.json().get("pillars", [])) == 4
    print("✅ /api/sdg-info working! Pillars count:", len(r7.json().get("pillars", [])))

    print("\n🎉 ALL SPECIALIZED ENDPOINTS VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    test_endpoints()
