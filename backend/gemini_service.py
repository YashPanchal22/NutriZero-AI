"""
NutriZero AI - Dedicated Google Gemini Service
Using the official current Google GenAI SDK (google-genai)
"""

import os
import re
import time
import base64
import socket
import asyncio
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

# Prioritize IPv4 over IPv6 on Windows to eliminate 20-30s connection timeout delays
_orig_getaddrinfo = socket.getaddrinfo
def _ipv4_preferred_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    try:
        res = _orig_getaddrinfo(host, port, family, type, proto, flags)
        return sorted(res, key=lambda x: 0 if x[0] == socket.AF_INET else 1)
    except Exception:
        return _orig_getaddrinfo(host, port, family, type, proto, flags)
socket.getaddrinfo = _ipv4_preferred_getaddrinfo

# Load environment variables
load_dotenv()

from google import genai
from google.genai import types

SYSTEM_INSTRUCTION = """You are NutriZero AI, an AI Food & Nutrition Assistant supporting UN SDG 2 – Zero Hunger.

Your purpose is to help users with affordable nutrition education, budget meal planning, recipes using available ingredients, food-waste reduction, food storage, affordable protein sources, grocery planning, food-security awareness, and SDG 2 education.

Give practical, concise, easy-to-understand answers.

When users provide ingredients, prioritize those ingredients.

When users provide a budget, respect the budget.

When users ask for a recipe, provide:
1. Recipe name
2. Ingredients
3. Cooking steps
4. Approximate cost
5. Basic nutrition information
6. Food-waste tip

When users ask for a meal plan, provide:
- Breakfast
- Lunch
- Dinner
- Optional snack
- Approximate total cost
- Basic nutrition overview

Use Indian foods and context when relevant.

Never invent exact food prices.
If prices are estimates, say they are approximate.

Nutrition values should be treated as approximate unless based on a reliable source.

Do not diagnose diseases.
Do not prescribe medicines.
Do not provide emergency medical treatment.

For medical concerns, provide general educational information and suggest consulting an appropriate qualified professional.

Be helpful, practical, safe, and budget-conscious.

End responses with 2 or 3 practical follow-up suggestions in this exact format:
Suggested Follow-Ups:
- [Follow-up question 1]
- [Follow-up question 2]
"""

class GeminiService:
    def __init__(self):
        self.default_model = os.getenv("GEMINI_MODEL", "gemini-3.6-flash").strip().strip('"\'')
        self.candidate_models = [
            self.default_model,
            "gemini-3.6-flash",
            "gemini-flash-latest",
            "gemini-3.8-flash",
            "gemini-flash-lite-latest",
        ]
        # De-duplicate while preserving order
        seen = set()
        self.candidate_models = [m for m in self.candidate_models if not (m in seen or seen.add(m))]
        self._last_status = None
        self._last_status_time = 0

    def get_api_key(self) -> str:
        key = os.getenv("GEMINI_API_KEY", "").strip().strip('"\'')
        return key

    def get_client(self) -> Optional[genai.Client]:
        key = self.get_api_key()
        if not key or key == "YOUR_GEMINI_API_KEY" or len(key) < 15:
            return None
        return genai.Client(api_key=key)

    async def check_status(self) -> Dict[str, Any]:
        now = time.time()
        # Return cached status if verified recently (within 45s)
        if self._last_status and (now - self._last_status_time < 45):
            return self._last_status

        key = self.get_api_key()
        if not key:
            self._last_status = {
                "connected": False,
                "provider": "Google Gemini",
                "message": "GEMINI_API_KEY is missing from backend configuration."
            }
            self._last_status_time = now
            return self._last_status

        client = self.get_client()
        if not client:
            self._last_status = {
                "connected": False,
                "provider": "Google Gemini",
                "message": "Invalid Gemini API key format."
            }
            self._last_status_time = now
            return self._last_status

        def _ping_sync():
            last_err = "Unknown error"
            for model_name in self.candidate_models:
                try:
                    resp = client.models.generate_content(
                        model=model_name,
                        contents="Ping. Respond with: OK"
                    )
                    if resp and resp.text:
                        return {
                            "connected": True,
                            "provider": "Google Gemini",
                            "model": model_name
                        }
                except Exception as e:
                    last_err = str(e)
                    continue
            return {
                "connected": False,
                "provider": "Google Gemini",
                "message": f"Gemini connection failed: {last_err}"
            }

        result = await asyncio.to_thread(_ping_sync)
        self._last_status = result
        self._last_status_time = time.time()
        return result

    def generate_chat_response(
        self,
        message: str,
        history: Optional[List[Dict[str, Any]]] = None,
        image_data: Optional[str] = None
    ) -> Dict[str, Any]:
        client = self.get_client()
        if not client:
            return {
                "error": True,
                "message": "Gemini AI is currently unavailable. Please check the API configuration and try again."
            }

        contents: List[Any] = []
        if history and isinstance(history, list):
            for h in history[-8:]:
                role = "model" if h.get("role") in ["model", "assistant", "ai"] else "user"
                text = h.get("content") or h.get("message") or ""
                if text.strip():
                    contents.append(
                        types.Content(
                            role=role,
                            parts=[types.Part.from_text(text=text.strip())]
                        )
                    )

        user_parts = []
        if image_data:
            img_bytes, mime = self._parse_image_data(image_data)
            if img_bytes and mime:
                user_parts.append(types.Part.from_bytes(data=img_bytes, mime_type=mime))

        user_parts.append(types.Part.from_text(text=message.strip()))

        contents.append(
            types.Content(
                role="user",
                parts=user_parts
            )
        )

        last_error = None
        for model_name in self.candidate_models:
            try:
                config = types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    temperature=0.6,
                    max_output_tokens=1500,
                )

                response = client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config=config
                )

                raw_text = getattr(response, "text", "") or ""
                if not raw_text.strip():
                    candidates = getattr(response, "candidates", [])
                    if candidates:
                        parts = getattr(candidates[0].content, "parts", [])
                        raw_text = "".join(getattr(p, "text", "") for p in parts if hasattr(p, "text"))

                if not raw_text.strip():
                    raise ValueError("Empty response received from Gemini API.")

                cleaned_reply, follow_ups = self._extract_follow_ups(raw_text)

                return {
                    "reply": cleaned_reply,
                    "followUps": follow_ups,
                    "model": model_name,
                    "provider": "Google Gemini"
                }
            except Exception as err:
                last_error = err
                time.sleep(0.5)
                continue

        return {
            "error": True,
            "message": "Gemini AI is currently unavailable. Please check the API configuration and try again."
        }

    def generate_recipe(self, ingredients: List[str]) -> Dict[str, Any]:
        prompt = (
            f"I have the following ingredients: {', '.join(ingredients)}.\n\n"
            "Please create a practical, budget-friendly recipe using these ingredients as primary items.\n"
            "Provide your response in this structured format:\n"
            "1. Recipe Name\n"
            "2. Ingredients (with practical measurements)\n"
            "3. Cooking Steps (numbered step-by-step)\n"
            "4. Approximate Cost (in INR / ₹ or approximate budget terms)\n"
            "5. Basic Nutrition Information (approximate calories, protein, fiber)\n"
            "6. Food-Waste Tip (how to use scraps/leftovers)\n"
        )
        return self.generate_chat_response(prompt)

    def generate_meal_plan(self, budget: str, people: int, diet: str) -> Dict[str, Any]:
        prompt = (
            f"Please create a complete 1-day budget meal plan for {people} person(s) with a total daily budget of {budget}.\n"
            f"Dietary preference: {diet}.\n\n"
            "Provide:\n"
            "- Breakfast\n"
            "- Lunch\n"
            "- Dinner\n"
            "- Optional Snack\n"
            "- Approximate Total Cost breakdown\n"
            "- Basic Nutrition Overview (approximate protein, calories, diversity)\n"
            "- Budget-saving and zero-waste tip\n"
        )
        return self.generate_chat_response(prompt)

    def generate_food_waste_guide(self, leftover_item: str) -> Dict[str, Any]:
        prompt = (
            f"I have leftover {leftover_item}.\n\n"
            "Provide:\n"
            "1. 2 to 3 creative, delicious reuse recipes or transformation ideas\n"
            "2. Safe storage guidance (fridge/freezer timeline and container recommendations)\n"
            "3. Signs of spoilage to look out for (food safety)\n"
            "4. Food-waste reduction hack for this item\n"
        )
        return self.generate_chat_response(prompt)

    def generate_grocery_plan(self, people: int, budget: str, meal_preferences: str) -> Dict[str, Any]:
        prompt = (
            f"Create a smart, prioritized grocery shopping list for {people} people with a target budget of {budget}.\n"
            f"Meal focus/needs: {meal_preferences}.\n\n"
            "Categorize the list into:\n"
            "- Essential Staples (Grains, Dals/Pulses, Atta)\n"
            "- Affordable Proteins (Eggs, Soya, Dals, Peanuts)\n"
            "- Seasonal Vegetables & Produce\n"
            "- Cooking Essentials (Oil, Spices)\n\n"
            "For each item, give: Item name, suggested quantity, approximate estimated cost, and nutritional value.\n"
            "Provide an estimated total budget summary at the end.\n"
        )
        return self.generate_chat_response(prompt)

    def _parse_image_data(self, image_data: str) -> (Optional[bytes], Optional[str]):
        try:
            mime = "image/jpeg"
            b64_str = image_data
            if "," in image_data and "data:" in image_data:
                header, b64_str = image_data.split(",", 1)
                match = re.search(r"data:([^;]+);base64", header)
                if match:
                    mime = match.group(1)
            raw_bytes = base64.b64decode(b64_str)
            return raw_bytes, mime
        except Exception as e:
            print(f"Error decoding image data: {e}")
            return None, None

    def generate_recipe_from_image(
        self,
        image_data: str,
        user_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        prompt = (user_prompt or "").strip()
        if not prompt:
            prompt = (
                "Please analyze the food, produce, or ingredients shown in this photo and create an inspiring, budget-friendly recipe.\n\n"
                "Structure your answer as follows:\n"
                "1. 📸 What I See: (Identify the key ingredients or dish present in the image)\n"
                "2. 🥘 Recipe Name: (A delicious, affordable dish you can make)\n"
                "3. 📋 Ingredients: (Complete list with practical home measurements)\n"
                "4. 👩‍🍳 Step-by-Step Cooking Method: (Numbered, clear preparation and cooking steps)\n"
                "5. 💰 Approximate Cost: (In INR / ₹, explaining why it is cost-effective)\n"
                "6. 🥗 Nutrition Breakdown: (Estimated calories, protein, fiber, and vitamins)\n"
                "7. ♻️ Food-Waste & Storage Tip: (How to use vegetable scraps, store leftovers, or extend freshness)"
            )
        else:
            prompt = (
                f"User question regarding this photo: {prompt}\n\n"
                "Analyze the food items in the image and provide a helpful, practical response. "
                "Include recipe steps, cost estimate in ₹, nutrition info, and food-waste tips."
            )
        return self.generate_chat_response(prompt, image_data=image_data)

    def _extract_follow_ups(self, text: str) -> (str, List[str]):
        marker_match = re.search(r'(\bSuggested Follow-Ups:|\bFollow-up Questions:)', text, re.IGNORECASE)
        if not marker_match:
            return text.strip(), []

        idx = marker_match.start()
        cleaned_reply = text[:idx].strip()
        follow_up_section = text[idx:]

        follow_ups = []
        for line in follow_up_section.split("\n"):
            m = re.match(r'^\s*[-*•\d.]+\s*(.+)$', line)
            if m:
                q = m.group(1).replace("[", "").replace("]", "").replace("*", "").strip()
                if q and len(q) > 6 and "suggested follow" not in q.lower():
                    follow_ups.append(q)

        return cleaned_reply, follow_ups[:3]

gemini_service = GeminiService()
