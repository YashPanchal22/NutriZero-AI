"""
NutriZero AI - FastAPI Backend Application
SDG 2 Zero Hunger Food & Nutrition Assistant
Integrated with Google GenAI SDK (google-genai)
"""

import os
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from pathlib import Path

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from pydantic import BaseModel, Field

from gemini_service import gemini_service

# Initialize FastAPI App
app = FastAPI(
    title="NutriZero AI - SDG 2 Zero Hunger Assistant",
    description="Official Google Gemini-powered food, nutrition, and zero-waste assistant.",
    version="2.0.0"
)

# CORS Configuration
# Allows requests from Vite dev server (http://localhost:5173), preview servers, and production origins
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# PYDANTIC SCHEMAS
# ==========================================

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User question or statement")
    history: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Recent conversation history")
    image: Optional[str] = Field(default=None, description="Optional base64 encoded image string")

class ImageRecipeRequest(BaseModel):
    image: str = Field(..., min_length=10, description="Base64 encoded image string")
    prompt: Optional[str] = Field(default=None, description="Optional prompt or question about the image")

class RecipeRequest(BaseModel):
    ingredients: List[str] = Field(..., min_length=1, description="List of available pantry ingredients")

class MealPlanRequest(BaseModel):
    budget: str = Field(default="₹150", description="Budget for the meal plan (e.g. ₹50, ₹100, ₹150, ₹200, ₹300)")
    people: int = Field(default=1, ge=1, le=20, description="Number of people")
    diet: str = Field(default="Vegetarian", description="Dietary preference: Vegetarian, Non-Vegetarian, Vegan, etc.")

class FoodWasteRequest(BaseModel):
    leftover: str = Field(..., min_length=1, description="Leftover item to reduce waste (e.g. leftover rice)")

class GroceryPlanRequest(BaseModel):
    budget: str = Field(default="₹500", description="Target grocery budget")
    people: int = Field(default=2, ge=1, le=20, description="Household size")
    preferences: Optional[str] = Field(default="Affordable nutritious staples", description="Dietary focus or meal preferences")

# ==========================================
# HEALTH & STATUS ENDPOINTS
# ==========================================

@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    """Root endpoint welcoming visitors and directing to interactive documentation"""
    return {
        "name": "NutriZero AI API",
        "status": "online",
        "docs": "/docs",
        "health": "/health",
        "description": "UN SDG 2 Zero Hunger Food & Nutrition Assistant"
    }

@app.api_route("/api/docs", methods=["GET", "HEAD"], include_in_schema=False)
async def api_docs_redirect():
    """Redirect /api/docs requests to FastAPI Swagger /docs"""
    return RedirectResponse(url="/docs")

@app.api_route("/api/openapi.json", methods=["GET", "HEAD"], include_in_schema=False)
async def api_openapi_redirect():
    """Redirect /api/openapi.json requests to /openapi.json"""
    return RedirectResponse(url="/openapi.json")

@app.api_route("/health", methods=["GET", "HEAD"])
@app.api_route("/api/health", methods=["GET", "HEAD"])
async def health_check():
    """Standard health check endpoint"""
    return {"status": "ok"}

@app.get("/api/gemini-status")
async def gemini_status():
    """
    Tests backend connectivity to Google Gemini API.
    Does NOT leak the API key.
    """
    result = await gemini_service.check_status()
    return result

# ==========================================
# CHAT API ENDPOINT
# ==========================================

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    """
    Main Chat API:
    Receives user query -> Calls Google Gemini -> Returns verified response
    """
    msg = req.message.strip()
    if not msg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A non-empty 'message' string is required."
        )

    # Call Gemini Service in worker thread to prevent event loop blocking
    ai_result = await asyncio.to_thread(
        gemini_service.generate_chat_response,
        message=msg,
        history=req.history,
        image_data=req.image
    )

    if ai_result.get("error"):
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "error": True,
                "message": "Gemini AI is currently unavailable. Please check the API configuration and try again.",
                "reply": "Gemini AI is currently unavailable. Please check the API configuration and try again."
            }
        )

    return {
        "reply": ai_result.get("reply", ""),
        "followUps": ai_result.get("followUps", []),
        "model": ai_result.get("model", "Google Gemini"),
        "provider": "Google Gemini"
    }

# ==========================================
# PHOTO RECIPE GENERATOR ENDPOINT
# ==========================================

@app.post("/api/recipe-from-image")
async def recipe_from_image_endpoint(req: ImageRecipeRequest):
    """
    Photo Recipe Generator:
    Takes an uploaded food / ingredients photo and generates a complete budget recipe.
    """
    ai_result = await asyncio.to_thread(
        gemini_service.generate_recipe_from_image,
        image_data=req.image,
        user_prompt=req.prompt
    )

    if ai_result.get("error"):
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "error": True,
                "message": ai_result.get("message", "Unable to analyze photo. Please try again."),
                "reply": "Unable to analyze this photo. Please make sure the image is clear and try again."
            }
        )

    return {
        "reply": ai_result.get("reply", ""),
        "followUps": ai_result.get("followUps", []),
        "model": ai_result.get("model", "Google Gemini"),
        "provider": "Google Gemini"
    }

# ==========================================
# PANTRY CHEF RECIPE ENDPOINT
# ==========================================

@app.post("/api/recipe")
async def recipe_endpoint(req: RecipeRequest):
    """
    Pantry Chef:
    Generates a structured recipe based on provided ingredients.
    """
    cleaned_ingredients = [i.strip() for i in req.ingredients if i.strip()]
    if not cleaned_ingredients:
        raise HTTPException(status_code=400, detail="At least one valid ingredient is required.")

    ai_result = await asyncio.to_thread(
        gemini_service.generate_recipe,
        ingredients=cleaned_ingredients
    )

    if ai_result.get("error"):
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "error": True,
                "message": "Gemini AI is currently unavailable. Please check the API configuration and try again."
            }
        )

    return {
        "reply": ai_result.get("reply", ""),
        "followUps": ai_result.get("followUps", []),
        "ingredients": cleaned_ingredients
    }

# ==========================================
# BUDGET MEAL PLANNER ENDPOINT
# ==========================================

@app.post("/api/meal-plan")
async def meal_plan_endpoint(req: MealPlanRequest):
    """
    Budget Meal Planner:
    Creates a full 1-day budget meal plan tailored to budget, people, and diet.
    """
    ai_result = await asyncio.to_thread(
        gemini_service.generate_meal_plan,
        budget=req.budget,
        people=req.people,
        diet=req.diet
    )

    if ai_result.get("error"):
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "error": True,
                "message": "Gemini AI is currently unavailable. Please check the API configuration and try again."
            }
        )

    return {
        "reply": ai_result.get("reply", ""),
        "followUps": ai_result.get("followUps", []),
        "budget": req.budget,
        "people": req.people,
        "diet": req.diet
    }

# ==========================================
# FOOD WASTE REDUCER ENDPOINT
# ==========================================

@app.post("/api/food-waste")
async def food_waste_endpoint(req: FoodWasteRequest):
    """
    Food Waste Reducer:
    Provides creative transformation recipes and storage hacks for leftovers.
    """
    leftover = req.leftover.strip()
    if not leftover:
        raise HTTPException(status_code=400, detail="Leftover food item cannot be empty.")

    ai_result = await asyncio.to_thread(
        gemini_service.generate_food_waste_guide,
        leftover_item=leftover
    )

    if ai_result.get("error"):
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "error": True,
                "message": "Gemini AI is currently unavailable. Please check the API configuration and try again."
            }
        )

    return {
        "reply": ai_result.get("reply", ""),
        "followUps": ai_result.get("followUps", []),
        "leftover": leftover
    }

# ==========================================
# GROCERY PLANNER ENDPOINT
# ==========================================

@app.post("/api/grocery-plan")
async def grocery_plan_endpoint(req: GroceryPlanRequest):
    """
    Grocery Planner:
    Builds a budget-conscious prioritized shopping list.
    """
    ai_result = await asyncio.to_thread(
        gemini_service.generate_grocery_plan,
        people=req.people,
        budget=req.budget,
        meal_preferences=req.preferences or "Affordable nutritious staples"
    )

    if ai_result.get("error"):
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "error": True,
                "message": "Gemini AI is currently unavailable. Please check the API configuration and try again."
            }
        )

    return {
        "reply": ai_result.get("reply", ""),
        "followUps": ai_result.get("followUps", []),
        "budget": req.budget,
        "people": req.people
    }

# ==========================================
# NUTRITION & KNOWLEDGE BASE ENDPOINTS
# ==========================================

@app.get("/api/nutrition-data")
async def get_nutrition_data():
    """
    Verified baseline dataset for common staples.
    All values are labeled as approximate estimates.
    """
    return {
        "disclaimer": "Nutritional values are approximate estimates based on standard nutritional reference tables (per 100g raw/standard portion).",
        "staples": [
            {
                "id": "rice",
                "name": "White / Brown Rice (Cooked)",
                "portion": "100g cooked (~1/2 cup)",
                "calories": 130,
                "protein": 2.7,
                "carbs": 28.2,
                "fat": 0.3,
                "fiber": 0.4,
                "costPerPortion": "₹4.50 ($0.06)",
                "keyNutrients": "Manganese, Selenium, Clean Bioavailable Energy",
                "sdgRole": "Global caloric backbone feeding over 3.5 billion people daily."
            },
            {
                "id": "dal",
                "name": "Yellow Moong / Masoor Dal (Cooked)",
                "portion": "100g cooked (~1 bowl)",
                "calories": 116,
                "protein": 9.0,
                "carbs": 20.0,
                "fat": 0.4,
                "fiber": 7.9,
                "costPerPortion": "₹6.00 ($0.08)",
                "keyNutrients": "Folate (48% DV), Iron, Magnesium, Potassium",
                "sdgRole": "Affordable plant protein champion with low nitrogen-footprint."
            },
            {
                "id": "egg",
                "name": "Whole Farm Egg",
                "portion": "1 Large Egg (~50g)",
                "calories": 72,
                "protein": 6.3,
                "carbs": 0.4,
                "fat": 4.8,
                "fiber": 0.0,
                "costPerPortion": "₹7.00 ($0.09)",
                "keyNutrients": "Vitamin B12, Choline, Vitamin D, Complete Amino Acids",
                "sdgRole": "High biological value protein vital for combating childhood stunting."
            },
            {
                "id": "soya",
                "name": "Soya Chunks / TVP (Dry)",
                "portion": "40g dry serving (~1 cup cooked)",
                "calories": 138,
                "protein": 21.0,
                "carbs": 13.0,
                "fat": 0.5,
                "fiber": 5.0,
                "costPerPortion": "₹9.00 ($0.11)",
                "keyNutrients": "Iron (45% DV), Calcium (14% DV), Isoflavones",
                "sdgRole": "Highest protein density per rupee in the world (52% protein by dry weight)."
            },
            {
                "id": "potato",
                "name": "Potato (Boiled with skin)",
                "portion": "100g (1 medium)",
                "calories": 87,
                "protein": 1.9,
                "carbs": 20.1,
                "fat": 0.1,
                "fiber": 1.8,
                "costPerPortion": "₹3.50 ($0.04)",
                "keyNutrients": "Potassium (higher than bananas), Vitamin C, Resistant Starch",
                "sdgRole": "High satiety index crop with exceptional yield per hectare."
            },
            {
                "id": "banana",
                "name": "Ripe Banana",
                "portion": "1 medium (~118g)",
                "calories": 105,
                "protein": 1.3,
                "carbs": 27.0,
                "fat": 0.3,
                "fiber": 3.1,
                "costPerPortion": "₹5.00 ($0.06)",
                "keyNutrients": "Potassium (358mg), Vitamin B6 (33% DV), Pectin",
                "sdgRole": "Year-round accessible energy and electrolyte replenisher."
            },
            {
                "id": "milk",
                "name": "Cow Milk (Toned)",
                "portion": "200ml glass",
                "calories": 120,
                "protein": 6.4,
                "carbs": 9.6,
                "fat": 6.0,
                "fiber": 0.0,
                "costPerPortion": "₹12.00 ($0.15)",
                "keyNutrients": "Calcium (240mg), Vitamin D, Riboflavin (B2)",
                "sdgRole": "Crucial micronutrient and bone health source for school-age children."
            },
            {
                "id": "peanuts",
                "name": "Roasted Peanuts (Groundnuts)",
                "portion": "30g handful",
                "calories": 170,
                "protein": 7.8,
                "carbs": 4.8,
                "fat": 14.8,
                "fiber": 2.6,
                "costPerPortion": "₹4.50 ($0.06)",
                "keyNutrients": "Niacin, Resveratrol, Monounsaturated Healthy Fats",
                "sdgRole": "Basis for Ready-to-Use Therapeutic Food (RUTF) in treating severe acute malnutrition."
            },
            {
                "id": "spinach",
                "name": "Fresh Spinach (Palak)",
                "portion": "100g raw",
                "calories": 23,
                "protein": 2.9,
                "carbs": 3.6,
                "fat": 0.4,
                "fiber": 2.2,
                "costPerPortion": "₹6.00 ($0.07)",
                "keyNutrients": "Vitamin K (483% DV), Vitamin A, Folate, Lutein",
                "sdgRole": "Low-cost leafy green to prevent hidden hunger and anemia."
            }
        ]
    }

@app.get("/api/food-storage")
async def get_storage_guidelines():
    """
    Practical, safe food storage recommendations.
    Emphasizes food safety without making unsafe absolute claims.
    """
    return {
        "disclaimer": "Storage recommendations are general food-safety guidelines. Always inspect food for unusual odors, discoloration, texture changes, or mold.",
        "guidelines": [
            {
                "item": "Cooked Rice & Khichdi",
                "duration": "3–4 days in refrigerator",
                "location": "Airtight container on middle fridge shelf",
                "safetyRule": "Refrigerate within 2 hours of cooking. Warm cooked rice left at room temperature risks Bacillus cereus spore germination and toxin formation. Reheat thoroughly until steaming (74°C / 165°F)."
            },
            {
                "item": "Cooked Dals & Lentil Curries",
                "duration": "3–4 days in fridge (or up to 3 months frozen)",
                "location": "Airtight glass or food-grade plastic container",
                "safetyRule": "Cool to room temperature before sealing. When reheating, bring to a rolling boil. Add a splash of water if thickened."
            },
            {
                "item": "Fresh Leafy Greens (Spinach, Coriander, Methi)",
                "duration": "7–12 days",
                "location": "Crisper drawer wrapped in dry cloth or paper towel",
                "safetyRule": "Do not wash greens until immediately before cooking! Moisture inside storage bags accelerates rot and bacterial slime."
            },
            {
                "item": "Potatoes & Onions",
                "duration": "3–5 weeks",
                "location": "Cool, dry, dark, well-ventilated basket (never fridge)",
                "safetyRule": "Store potatoes and onions in separate bins! Onions release ethylene gas that triggers potato sprouting and greening (solanine)."
            },
            {
                "item": "Fresh Farm Eggs",
                "duration": "3–5 weeks refrigerated",
                "location": "Middle shelf in original carton (not door rack)",
                "safetyRule": "Door shelves experience temperature swings each time the fridge opens. Center shelves maintain stable 4°C temperature."
            },
            {
                "item": "Fresh Whole Lemons",
                "duration": "3–4 weeks",
                "location": "Submerged in a clean jar of water inside fridge",
                "safetyRule": "Water prevents skin dehydration, keeping lemons plump and juicy 4x longer than open counter storage."
            },
            {
                "item": "Cut Raw Vegetables (Carrots, Cucumbers)",
                "duration": "4–6 days",
                "location": "Submerged in water container in fridge",
                "safetyRule": "Change water every 2 days to maintain crispness and prevent bacterial stagnation."
            }
        ]
    }

@app.get("/api/sdg-info")
async def get_sdg_info():
    """
    Verified UN SDG 2 - Zero Hunger educational content.
    """
    return {
        "title": "SDG 2: Zero Hunger",
        "subtitle": "End hunger, achieve food security and improved nutrition and promote sustainable agriculture by 2030",
        "organization": "United Nations & Food and Agriculture Organization (FAO)",
        "pillars": [
            {
                "name": "Availability (Supply)",
                "description": "Consistent, sufficient supply of nutritious food through climate-resilient agriculture, smallholder productivity, and robust domestic supply chains."
            },
            {
                "name": "Access (Economic & Physical)",
                "description": "Equitable economic purchasing power and physical access so no household is excluded from healthy diets due to poverty or food deserts."
            },
            {
                "name": "Utilization (Nutritional & Biological)",
                "description": "Proper biological absorption through dietary diversity, clean drinking water, safe food preparation, and sanitation."
            },
            {
                "name": "Stability (Resilience Over Time)",
                "description": "Continuous food security capable of withstanding climate shocks, seasonal price volatility, and economic disruptions."
            }
        ],
        "keyTargets": [
            {
                "code": "Target 2.1",
                "title": "Universal Access to Safe & Nutritious Food",
                "description": "Ensure year-round access by all people, especially the poor and people in vulnerable situations, to safe, nutritious, and sufficient food."
            },
            {
                "code": "Target 2.2",
                "title": "End All Forms of Malnutrition",
                "description": "Address stunting and wasting in children under 5, and resolve nutritional needs of adolescent girls, pregnant and lactating women, and older persons."
            },
            {
                "code": "Target 2.3",
                "title": "Double Small-Scale Producer Productivity",
                "description": "Double agricultural productivity and incomes of small-scale food producers, family farmers, pastoralists, and fishers."
            },
            {
                "code": "Target 2.4",
                "title": "Sustainable Food Production & Resilient Agriculture",
                "description": "Implement resilient agricultural practices that increase productivity and production, help maintain ecosystems, and strengthen capacity for climate adaptation."
            }
        ],
        "foodWasteFacts": [
            "Approximately one-third of all food produced globally for human consumption (1.3 billion tonnes) is lost or wasted each year.",
            "Reducing household food waste is one of the top single actions individuals can take to combat global greenhouse gas emissions and lower food costs.",
            "Meal planning, sensible portion sizing, and understanding storage lifetimes can prevent up to 80% of household food spoilage."
        ],
        "individualActions": [
            {"action": "Smart Ingredient Cooking", "detail": "Prioritize perishable items first (leafy greens, ripe tomatoes) and build meals around what you already have in your pantry."},
            {"action": "Proper Storage Techniques", "detail": "Refrigerate leftovers within 2 hours; store potatoes separate from onions to prevent premature sprouting."},
            {"action": "Embrace Plant Proteins", "detail": "Incorporate lentils, chickpeas, and soya chunks to lower grocery bills and environmental resource intensity."},
            {"action": "Batch Cook & Freeze", "detail": "Cook grains and dals in bulk, portioning and freezing to prevent spoilage and eliminate emergency takeout spending."}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"Starting NutriZero AI backend on port {port}...")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
