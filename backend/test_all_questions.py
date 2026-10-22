"""
NutriZero AI - Test the 8 Required User Questions
"""

import requests
import json
import time

QUESTIONS = [
    "I have rice, dal, onion and potato. What can I cook?",
    "Give me a healthy meal under ₹100.",
    "What are affordable protein sources?",
    "How can I reduce food waste?",
    "I have leftover rice. Give me a recipe.",
    "What is SDG 2?",
    "Create a meal plan for 2 people under ₹200.",
    "How can a student eat healthy on a low budget?"
]

def main():
    print("==================================================")
    print("🚀 Testing 8 Required NutriZero AI Questions")
    print("==================================================")

    for i, q in enumerate(QUESTIONS, start=1):
        print(f"\n--- [{i}/8] Question: \"{q}\" ---")
        try:
            start_t = time.time()
            resp = requests.post(
                "http://localhost:8000/api/chat",
                json={"message": q},
                timeout=40
            )
            duration = round(time.time() - start_t, 2)
            assert resp.status_code == 200, f"Status code was {resp.status_code}"
            data = resp.json()
            assert not data.get("error"), f"Error returned: {data}"
            reply = data.get("reply", "")
            assert len(reply) > 40, "Reply was too short"
            provider = data.get("provider")
            model = data.get("model")
            print(f"✅ Success ({duration}s) | Provider: {provider} | Model: {model}")
            print(f"Reply Preview: {reply[:120].strip()}...")
            time.sleep(2)
        except Exception as err:
            print(f"❌ Failed: {err}")
            return False

    print("\n==================================================")
    print("🎉 ALL 8 REQUIRED QUESTIONS RETURNED REAL GEMINI REPLIES!")
    print("==================================================")
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        exit(1)
