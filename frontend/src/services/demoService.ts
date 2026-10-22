/**
 * NutriZero AI - Standalone Client-Side Demo Service
 * Enables 100% functionality on GitHub Pages without requiring a backend server.
 * Supports:
 *  - Offline intelligent nutrition and SDG 2 AI knowledge generation
 *  - Dynamic Pantry Chef recipes, Budget Meal Plans, Food Waste Hacks, and Grocery Plans
 *  - Verified UN SDG 2 facts, storage guidelines, and nutrition datasets
 *  - Optional direct Google Gemini API calls if the user supplies their own API key in browser settings
 */

export interface DemoResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

// -------------------------------------------------------------
// Verified Datasets (mirrored from backend)
// -------------------------------------------------------------
export const DEMO_NUTRITION_DATA = {
  disclaimer: "Nutritional values are approximate estimates based on standard nutritional reference tables (per 100g raw/standard portion).",
  staples: [
    {
      id: "rice",
      name: "White / Brown Rice (Cooked)",
      portion: "100g cooked (~1/2 cup)",
      calories: 130,
      protein: 2.7,
      carbs: 28.2,
      fat: 0.3,
      fiber: 0.4,
      costPerPortion: "₹4.50 ($0.06)",
      keyNutrients: "Manganese, Selenium, Clean Bioavailable Energy",
      sdgRole: "Global caloric backbone feeding over 3.5 billion people daily."
    },
    {
      id: "dal",
      name: "Yellow Moong / Masoor Dal (Cooked)",
      portion: "100g cooked (~1 bowl)",
      calories: 116,
      protein: 9.0,
      carbs: 20.0,
      fat: 0.4,
      fiber: 7.9,
      costPerPortion: "₹6.00 ($0.08)",
      keyNutrients: "Folate (48% DV), Iron, Magnesium, Potassium",
      sdgRole: "Affordable plant protein champion with low nitrogen-footprint."
    },
    {
      id: "egg",
      name: "Whole Farm Egg",
      portion: "1 Large Egg (~50g)",
      calories: 72,
      protein: 6.3,
      carbs: 0.4,
      fat: 4.8,
      fiber: 0.0,
      costPerPortion: "₹7.00 ($0.09)",
      keyNutrients: "Vitamin B12, Choline, Vitamin D, Complete Amino Acids",
      sdgRole: "High biological value protein vital for combating childhood stunting."
    },
    {
      id: "soya",
      name: "Soya Chunks / TVP (Dry)",
      portion: "40g dry serving (~1 cup cooked)",
      calories: 138,
      protein: 21.0,
      carbs: 13.0,
      fat: 0.5,
      fiber: 5.0,
      costPerPortion: "₹9.00 ($0.11)",
      keyNutrients: "Iron (45% DV), Calcium (14% DV), Isoflavones",
      sdgRole: "Highest protein density per rupee in the world (52% protein by dry weight)."
    },
    {
      id: "potato",
      name: "Potato (Boiled with skin)",
      portion: "100g (1 medium)",
      calories: 87,
      protein: 1.9,
      carbs: 20.1,
      fat: 0.1,
      fiber: 1.8,
      costPerPortion: "₹3.50 ($0.04)",
      keyNutrients: "Potassium (higher than bananas), Vitamin C, Resistant Starch",
      sdgRole: "High satiety index crop with exceptional yield per hectare."
    },
    {
      id: "banana",
      name: "Ripe Banana",
      portion: "1 medium (~118g)",
      calories: 105,
      protein: 1.3,
      carbs: 27.0,
      fat: 0.3,
      fiber: 3.1,
      costPerPortion: "₹5.00 ($0.06)",
      keyNutrients: "Potassium (358mg), Vitamin B6 (33% DV), Pectin",
      sdgRole: "Year-round accessible energy and electrolyte replenisher."
    },
    {
      id: "milk",
      name: "Cow Milk (Toned)",
      portion: "200ml glass",
      calories: 120,
      protein: 6.4,
      carbs: 9.6,
      fat: 6.0,
      fiber: 0.0,
      costPerPortion: "₹12.00 ($0.15)",
      keyNutrients: "Calcium (240mg), Vitamin D, Riboflavin (B2)",
      sdgRole: "Crucial micronutrient and bone health source for school-age children."
    },
    {
      id: "peanuts",
      name: "Roasted Peanuts (Groundnuts)",
      portion: "30g handful",
      calories: 170,
      protein: 7.8,
      carbs: 4.8,
      fat: 14.8,
      fiber: 2.6,
      costPerPortion: "₹4.50 ($0.06)",
      keyNutrients: "Niacin, Resveratrol, Monounsaturated Healthy Fats",
      sdgRole: "Basis for Ready-to-Use Therapeutic Food (RUTF) in treating severe acute malnutrition."
    },
    {
      id: "spinach",
      name: "Fresh Spinach (Palak)",
      portion: "100g raw",
      calories: 23,
      protein: 2.9,
      carbs: 3.6,
      fat: 0.4,
      fiber: 2.2,
      costPerPortion: "₹6.00 ($0.07)",
      keyNutrients: "Vitamin K (483% DV), Vitamin A, Folate, Lutein",
      sdgRole: "Low-cost leafy green to prevent hidden hunger and anemia."
    }
  ]
};

export const DEMO_FOOD_STORAGE = {
  disclaimer: "Storage recommendations are general food-safety guidelines. Always inspect food for unusual odors, discoloration, texture changes, or mold.",
  guidelines: [
    {
      item: "Cooked Rice & Khichdi",
      duration: "3–4 days in refrigerator",
      location: "Airtight container on middle fridge shelf",
      safetyRule: "Refrigerate within 2 hours of cooking. Warm cooked rice left at room temperature risks Bacillus cereus spore germination and toxin formation. Reheat thoroughly until steaming (74°C / 165°F)."
    },
    {
      item: "Cooked Dals & Lentil Curries",
      duration: "3–4 days in fridge (or up to 3 months frozen)",
      location: "Airtight glass or food-grade plastic container",
      safetyRule: "Cool to room temperature before sealing. When reheating, bring to a rolling boil. Add a splash of water if thickened."
    },
    {
      item: "Fresh Leafy Greens (Spinach, Coriander, Methi)",
      duration: "7–12 days",
      location: "Crisper drawer wrapped in dry cloth or paper towel",
      safetyRule: "Do not wash greens until immediately before cooking! Moisture inside storage bags accelerates rot and bacterial slime."
    },
    {
      item: "Potatoes & Onions",
      duration: "3–5 weeks",
      location: "Cool, dry, dark, well-ventilated basket (never fridge)",
      safetyRule: "Store potatoes and onions in separate bins! Onions release ethylene gas that triggers potato sprouting and greening (solanine)."
    },
    {
      item: "Fresh Farm Eggs",
      duration: "3–5 weeks refrigerated",
      location: "Middle shelf in original carton (not door rack)",
      safetyRule: "Door shelves experience temperature swings each time the fridge opens. Center shelves maintain stable 4°C temperature."
    },
    {
      item: "Fresh Whole Lemons",
      duration: "3–4 weeks",
      location: "Submerged in a clean jar of water inside fridge",
      safetyRule: "Water prevents skin dehydration, keeping lemons plump and juicy 4x longer than open counter storage."
    },
    {
      item: "Cut Raw Vegetables (Carrots, Cucumbers)",
      duration: "4–6 days",
      location: "Submerged in water container in fridge",
      safetyRule: "Change water every 2 days to maintain crispness and prevent bacterial stagnation."
    }
  ]
};

export const DEMO_SDG_INFO = {
  title: "SDG 2: Zero Hunger",
  subtitle: "End hunger, achieve food security and improved nutrition and promote sustainable agriculture by 2030",
  organization: "United Nations & Food and Agriculture Organization (FAO)",
  pillars: [
    {
      name: "Availability (Supply)",
      description: "Consistent, sufficient supply of nutritious food through climate-resilient agriculture, smallholder productivity, and robust domestic supply chains."
    },
    {
      name: "Access (Economic & Physical)",
      description: "Equitable economic purchasing power and physical access so no household is excluded from healthy diets due to poverty or food deserts."
    },
    {
      name: "Utilization (Nutritional & Biological)",
      description: "Proper biological absorption through dietary diversity, clean drinking water, safe food preparation, and sanitation."
    },
    {
      name: "Stability (Resilience Over Time)",
      description: "Continuous food security capable of withstanding climate shocks, seasonal price volatility, and economic disruptions."
    }
  ],
  keyTargets: [
    {
      code: "Target 2.1",
      title: "Universal Access to Safe & Nutritious Food",
      description: "Ensure year-round access by all people, especially the poor and people in vulnerable situations, to safe, nutritious, and sufficient food."
    },
    {
      code: "Target 2.2",
      title: "End All Forms of Malnutrition",
      description: "Address stunting and wasting in children under 5, and resolve nutritional needs of adolescent girls, pregnant and lactating women, and older persons."
    },
    {
      code: "Target 2.3",
      title: "Double Small-Scale Producer Productivity",
      description: "Double agricultural productivity and incomes of small-scale food producers, family farmers, pastoralists, and fishers."
    },
    {
      code: "Target 2.4",
      title: "Sustainable Food Production & Resilient Agriculture",
      description: "Implement resilient agricultural practices that increase productivity and production, help maintain ecosystems, and strengthen capacity for climate adaptation."
    }
  ],
  foodWasteFacts: [
    "Approximately one-third of all food produced globally for human consumption (1.3 billion tonnes) is lost or wasted each year.",
    "Reducing household food waste is one of the top single actions individuals can take to combat global greenhouse gas emissions and lower food costs.",
    "Meal planning, sensible portion sizing, and understanding storage lifetimes can prevent up to 80% of household food spoilage."
  ],
  individualActions: [
    { action: "Smart Ingredient Cooking", detail: "Prioritize perishable items first (leafy greens, ripe tomatoes) and build meals around what you already have in your pantry." },
    { action: "Proper Storage Techniques", detail: "Refrigerate leftovers within 2 hours; store potatoes separate from onions to prevent premature sprouting." },
    { action: "Embrace Plant Proteins", detail: "Incorporate lentils, chickpeas, and soya chunks to lower grocery bills and environmental resource intensity." },
    { action: "Batch Cook & Freeze", detail: "Cook grains and dals in bulk, portioning and freezing to prevent spoilage and eliminate emergency takeout spending." }
  ]
};

// -------------------------------------------------------------
// Dynamic Generators for Demo Mode
// -------------------------------------------------------------

export function generateDemoRecipe(ingredients: string[]): { reply: string; followUps: string[]; ingredients: string[] } {
  const ingStr = ingredients.join(', ');
  const mainIngredient = ingredients[0] || 'Available Staples';

  const reply = `### 🍳 Pantry Chef Budget Creation: Savory ${mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1)} Stir-Pan

**⏱️ Prep Time:** 10 mins | **🔥 Cook Time:** 15 mins | **💰 Estimated Cost:** ~₹35 - ₹55 per serving

#### 🛒 Ingredients Utilized:
${ingredients.map(ing => `- **${ing.trim()}** (measured to taste)`).join('\n')}
- *Pantry Basics:* 1 tbsp cooking oil, salt, ground black pepper, pinch of turmeric or cumin.

#### 🧑‍🍳 Step-by-Step Instructions:
1. **Prep the Base:** Clean and slice your ingredients. If utilizing legumes or grains, ensure they are pre-boiled or lightly steamed.
2. **Infuse Aromatics:** Heat oil in a pan over medium flame. Add garlic, onions, or cumin seeds if available until fragrant (1-2 mins).
3. **Sauté Main Ingredients:** Add **${ingStr}**, cooking the firmer vegetables/proteins first for 4-5 minutes until tender-crisp.
4. **Season & Harmonize:** Sprinkle salt, pepper, and a pinch of chili powder or herbs. Toss vigorously to evenly coat all ingredients.
5. **Simmer & Serve:** Lower heat, cover for 2 minutes to let flavors meld. Garnish with chopped coriander or lemon squeeze. Serve hot!

---
💡 **Zero-Waste & SDG 2 Nutrition Tip:** 
*Vegetable stems, peels, and herb stalks can be frozen in a bag to make nutrient-rich vegetable stock. This recipe maximizes biological utilization and prevents household food discard.*`;

  return {
    reply,
    ingredients,
    followUps: [
      `What can I make if I also add eggs?`,
      `How should I store leftovers of this recipe?`,
      `Give me a high-protein variation under ₹50`
    ]
  };
}

export function generateDemoMealPlan(budget: string, people: number, diet: string): { reply: string; followUps: string[]; budget: string; people: number; diet: string } {
  const perPersonCost = budget.includes('₹') ? budget : `₹${budget}`;

  const reply = `### 🥗 1-Day Balanced Budget Meal Plan
**Target Budget:** ${perPersonCost} | **Household Size:** ${people} person(s) | **Dietary Profile:** ${diet}

---

#### 🌅 Breakfast (Energizing Start)
- **Meal:** Masala Oats with peanuts & chopped carrots, or 2 Spiced Moong Dal Chillas / Scrambled Farm Eggs with toasted roti.
- **Estimated Cost:** ~₹15 - ₹20 per serving
- **Nutritional Focus:** Complex carbohydrates, healthy morning fats, and bioavailable protein.

#### ☀️ Lunch (Power & Satiety)
- **Meal:** Hearty Yellow Lentil Dal (Tadka) served with Steamed Brown/White Rice, lightly sautéed seasonal greens (Spinach/Cabbage), and fresh sliced cucumber.
- **Estimated Cost:** ~₹25 - ₹35 per serving
- **Nutritional Focus:** 18g+ plant protein, gut-friendly fiber, iron, and folate.

#### ☕ Afternoon Snack (Sustained Focus)
- **Meal:** Roasted Spiced Chana (Bengal Gram) or 1 Fresh Banana with a glass of warm spiced milk / herbal tea.
- **Estimated Cost:** ~₹10 per serving
- **Nutritional Focus:** Sustained low-glycemic satiety without blood sugar spikes.

#### 🌙 Dinner (Light & Restorative)
- **Meal:** Quick Vegetable Khichdi or Soya Chunk Curry with 2 Whole Wheat Chapatis.
- **Estimated Cost:** ~₹25 - ₹30 per serving
- **Nutritional Focus:** Easy digestion, high amino acid completeness, and micronutrient absorption.

---
📊 **Approximate Daily Nutritional Breakdown (Per Person):**
- **Calories:** ~1,850 - 2,100 kcal
- **Protein:** ~55g - 65g
- **Fiber:** ~28g
- **SDG 2 Alignment:** Fits within typical zero-hunger household budget tiers while delivering 100% of basic daily macro targets.`;

  return {
    reply,
    budget,
    people,
    diet,
    followUps: [
      `How can I prep this for a 3-day workweek?`,
      `Show me the grocery shopping list for this plan`,
      `Can I swap soya chunks for paneer or tofu?`
    ]
  };
}

export function generateDemoFoodWaste(leftover: string): { reply: string; followUps: string[]; leftover: string } {
  const item = leftover.trim();

  const reply = `### ♻️ Food Waste Revival: ${item.charAt(0).toUpperCase() + item.slice(1)}

Do not throw it away! Up to 40% of food waste occurs because we lack quick repurposing ideas. Here are 3 creative ways to turn **${item}** into fresh, safe meals:

---

#### 1. 🍳 Transformation Hack: Crispy Golden Cutlets / Tikkis
- **Method:** Mash your **${item}** with a boiled potato or breadcrumbs, add finely chopped onions, green chili, and garam masala. Shape into patties and shallow-fry on a tawa with a drizzle of oil until golden brown.
- **Result:** Delicious teatime snack or sandwich patty in under 10 minutes.

#### 2. 🍲 Warm One-Pot Broth & Upcycled Porridge
- **Method:** If you have grains, dal, or vegetable trimmings, simmer them with 2 cups of water, grated ginger, and a pinch of turmeric. Blend smooth or enjoy rustic with a squeeze of fresh lemon.
- **Result:** Comforting, gut-healing soup with zero ingredient loss.

#### 3. 🌯 Quick Wrap / Stuffed Paratha Filling
- **Method:** Sauté the **${item}** with cumin and chili flakes until excess moisture evaporates. Spread inside a warm chapati, roll up with a dollop of yogurt or chutney.
- **Result:** Portable lunch for work or school.

---
🛡️ **Food Safety & Storage Guidelines:**
- **Refrigerate:** Cool to room temperature and store in an airtight container within 2 hours.
- **Reheat Safely:** Bring to piping hot temperature (>74°C / 165°F) before eating.
- **Shelf Life:** Safe to consume within 3 to 4 days refrigerated.`;

  return {
    reply,
    leftover,
    followUps: [
      `How do I know if ${item} has gone bad?`,
      `Can I freeze ${item} for later use?`,
      `Show me more zero-waste kitchen hacks`
    ]
  };
}

export function generateDemoGroceryPlan(budget: string, people: number, preferences?: string): { reply: string; followUps: string[]; budget: string; people: number } {
  const reply = `### 🛒 Smart Zero-Waste Grocery Shopping Plan
**Budget:** ${budget} | **Household:** ${people} person(s) | **Focus:** ${preferences || 'Nutritious Low-Cost Staples'}

---

#### 🥇 Priority 1: High-Nutrient Foundation Staples (60% of Budget)
- **Grains:** Rice (2-3 kg) + Whole Wheat Atta (2 kg) — *~₹180 - ₹220*
- **Legumes & Pulses:** Yellow Moong Dal (500g) + Brown Chana / Chickpeas (500g) — *~₹110 - ₹140*
- **Soya Chunks (TVP):** 200g box (52% protein per rupee) — *~₹40*

#### 🥈 Priority 2: Perishable Fresh Produce (25% of Budget)
- **All-Weather Aromatics:** Onions (1 kg), Potatoes (1 kg) — *~₹70 - ₹90*
- **Nutritious Seasonal Veggies:** Spinach/Methi (2 bunches) + Seasonal Gourds/Carrots (500g) — *~₹50 - ₹70*
- **Fruit / Quick Potassium:** Half dozen ripe bananas — *~₹30 - ₹40*

#### 🥉 Priority 3: Cooking Fats & Seasonings (15% of Budget)
- **Mustard / Sunflower Oil:** 500ml pouch — *~₹65 - ₹80*
- **Basic Spices:** Iodized salt, turmeric, cumin seeds — *~₹35*

---
💡 **Smart Shopping Hacks to Save 30% More:**
1. **Never shop hungry:** Reduces impulse purchases by up to 25%.
2. **Buy whole staples, not processed:** Whole lentils and loose grains are up to 40% cheaper than pre-packaged varieties.
3. **Use the "First-In, First-Out" (FIFO) system** in your kitchen pantry to prevent food expiring before use.`;

  return {
    reply,
    budget,
    people,
    followUps: [
      `How should I store these items to make them last 3+ weeks?`,
      `Give me a 7-day meal plan based on this grocery list`,
      `What are the best seasonal vegetables this month?`
    ]
  };
}

export function generateDemoChatResponse(message: string): { reply: string; followUps: string[]; model: string; provider: string } {
  const lower = message.toLowerCase();

  let reply = "";
  let followUps = [
    "What can I cook with leftover rice and eggs?",
    "Show me a 1-day budget meal plan for ₹150",
    "How does NutriZero AI support UN SDG 2?"
  ];

  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey") || lower.includes("who are you")) {
    reply = `Hello! 👋 I am **NutriZero AI**, your intelligent UN SDG 2 Zero Hunger assistant.

I help you:
- 🥗 **Cook smart recipes** using ingredients currently in your pantry
- 💰 **Plan healthy, budget-conscious meals** for your family
- ♻️ **Transform leftovers** and eliminate kitchen food waste
- 🛡️ **Store foods safely** to prevent spoilage and bacteria
- 📊 **Understand essential nutrition** to ensure complete dietary health

*How can I assist you with your food or kitchen today? Feel free to ask a recipe, ingredient nutrition question, or meal planning tip!*`;
    followUps = [
      "Generate a high-protein recipe with lentils and onions",
      "How to store cooked rice safely?",
      "What are the 4 pillars of food security?"
    ];
  } else if (lower.includes("sdg") || lower.includes("hunger") || lower.includes("zero hunger")) {
    reply = `### 🌍 UN Sustainable Development Goal 2: Zero Hunger

**Goal 2** aims to **"End hunger, achieve food security and improved nutrition, and promote sustainable agriculture"** by the year 2030.

#### 🏛️ The 4 Vital Pillars of Food Security:
1. **Availability:** Ensuring an adequate, consistent supply of nutritious food.
2. **Access:** Economic and physical ability for all individuals to obtain nourishing diets.
3. **Utilization:** Biological absorption of nutrients through balanced diets, clean water, and sanitation.
4. **Stability:** Resilience against seasonal crop failures, climate shocks, and price volatility.

#### 💡 How Every Household Can Take Action:
- **Minimize Food Loss:** Roughly 1/3 of all global food produced is lost or wasted.
- **Champion Affordable Plant Proteins:** Incorporating lentils, pulses, and soya reduces costs while delivering complete amino acids.
- **Sensible Storage:** Refrigerating leftovers within 2 hours prevents foodborne illness and saves household money.`;
    followUps = [
      "Tell me more about Target 2.1 & 2.2",
      "What foods have the lowest environmental footprint?",
      "How can I cut food waste at home?"
    ];
  } else if (lower.includes("protein") || lower.includes("muscle") || lower.includes("gym")) {
    reply = `### 💪 High-Protein Budget Champions (Under ₹15 / Serving)

Getting high-quality protein does not require expensive supplements. Here are the top budget-friendly sources:

| Food Source | Protein per 100g | Approximate Cost | Key Benefit |
| :--- | :--- | :--- | :--- |
| **Soya Chunks (Dry)** | **52g** | ₹9.00 / 40g | Highest protein density per rupee |
| **Yellow Moong Dal** | **24g** (dry) | ₹6.00 / portion | Easy to digest, high in folate |
| **Whole Farm Eggs** | **13g** (2 eggs) | ₹14.00 | Complete amino acid profile + B12 |
| **Roasted Peanuts** | **26g** | ₹4.50 / 30g | Healthy fats + sustained satiety |
| **Sprouted Green Gram** | **24g** | ₹8.00 / portion | Bioavailability boosts when sprouted |

💡 **Pro Tip:** Combine grains (like rice or roti) with pulses (like dal or rajma) to form **complete proteins** containing all 9 essential amino acids!`;
    followUps = [
      "Create a 70g daily protein meal plan on a budget",
      "How do I cook delicious soya chunks without a rubbery texture?",
      "Are eggs or lentils better for muscle recovery?"
    ];
  } else if (lower.includes("storage") || lower.includes("spoil") || lower.includes("fridge") || lower.includes("shelf life")) {
    reply = `### 🛡️ Smart Food Storage & Safety Best Practices

1. **The 2-Hour Rule:** Cooked rice, meats, and curries must be stored in the refrigerator within **2 hours** of cooking to prevent bacterial spore germination (e.g., *Bacillus cereus*).
2. **Potatoes & Onions:** **Never store together!** Onions emit ethylene gas that causes potatoes to sprout prematurely and produce bitter solanine. Keep both in cool, ventilated baskets.
3. **Fresh Leafy Greens:** Store unwashed in the crisper drawer wrapped in a dry cloth or paper towel. Only wash immediately before cooking to prevent bacterial slime.
4. **Reheating Safety:** Always bring reheated leftovers to a steaming temperature (>74°C / 165°F) before eating.`;
    followUps = [
      "How long does cooked dal last in the fridge?",
      "Can I freeze lemons or tomatoes?",
      "Show all storage guidelines"
    ];
  } else {
    reply = `### 🥗 NutriZero AI Guidance

Thank you for your question about **"${message.slice(0, 50)}..."**!

Here is actionable, budget-conscious guidance aligned with UN SDG 2 nutrition principles:

1. **Nutrient-Dense Approach:** Focus on accessible staples like whole grains, legumes, seasonal vegetables, and healthy local fats.
2. **Cost-Effective Satiety:** Pairing complex carbohydrates with dietary fiber and plant protein stabilizes energy and prevents midday hunger spikes.
3. **Kitchen Sustainability:** Always utilize stems, peels, and leftovers in broths or quick stir-fries to maximize food value and eliminate waste.

*Need a recipe with specific ingredients, a custom meal plan, or food storage advice? Try our specialized tools in the sidebar or ask right here!*`;
    followUps = [
      "Suggest a quick 15-minute dinner recipe",
      "Give me a budget grocery shopping list",
      "How do I store fresh vegetables longer?"
    ];
  }

  return {
    reply,
    followUps,
    model: "NutriZero AI Knowledge Engine (Demo Mode)",
    provider: "NutriZero AI Standalone"
  };
}

// -------------------------------------------------------------
// Direct Browser Gemini API Call (Optional if user enters key)
// -------------------------------------------------------------
export async function tryDirectGeminiApi(prompt: string, history: any[] = []): Promise<string | null> {
  try {
    const userApiKey = localStorage.getItem('nutrizero_gemini_api_key')?.trim();
    if (!userApiKey) return null;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(userApiKey)}`;

    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: String(h.content || '') }]
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const systemInstruction = {
      role: 'user',
      parts: [{
        text: "You are NutriZero AI, an official UN SDG 2 Zero Hunger food, nutrition, budget meal planning, and food waste assistant. Provide practical, empathetic, and evidence-based answers with realistic prices (in ₹ INR and $ USD) and safe food preparation tips."
      }]
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [systemInstruction, ...contents],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      })
    });

    if (!response.ok) {
      console.warn('Direct Gemini API call failed with status:', response.status);
      return null;
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || null;
  } catch (err) {
    console.warn('Failed direct Gemini API request', err);
    return null;
  }
}

// -------------------------------------------------------------
// Universal Request Dispatcher
// -------------------------------------------------------------
export async function handleDemoRequest(url: string, method: string = 'GET', data?: any): Promise<DemoResponse> {
  // Add realistic micro-delay for realistic UI feedback
  await new Promise(resolve => setTimeout(resolve, 300));

  const cleanUrl = url.split('?')[0].replace(/\/$/, '');

  // 1. Gemini / Server Status
  if (cleanUrl.endsWith('/api/gemini-status') || cleanUrl.endsWith('/health') || cleanUrl.endsWith('/api/health')) {
    const hasCustomKey = !!localStorage.getItem('nutrizero_gemini_api_key');
    return {
      status: 200,
      statusText: 'OK',
      data: {
        connected: true,
        provider: hasCustomKey ? 'Google Gemini API (Direct Browser)' : 'NutriZero Standalone Engine',
        model: hasCustomKey ? 'gemini-1.5-flash (Live Key)' : 'NutriZero AI Offline Knowledge Engine',
        status: 'healthy',
        message: 'Standalone Demo Mode is active. All features fully operational without a server!'
      }
    };
  }

  // 2. UN SDG 2 Data
  if (cleanUrl.endsWith('/api/sdg-info')) {
    return {
      status: 200,
      statusText: 'OK',
      data: DEMO_SDG_INFO
    };
  }

  // 3. Nutrition Baseline Dataset
  if (cleanUrl.endsWith('/api/nutrition-data')) {
    return {
      status: 200,
      statusText: 'OK',
      data: DEMO_NUTRITION_DATA
    };
  }

  // 4. Food Storage Guidelines
  if (cleanUrl.endsWith('/api/food-storage')) {
    return {
      status: 200,
      statusText: 'OK',
      data: DEMO_FOOD_STORAGE
    };
  }

  // 5. Pantry Chef Recipe
  if (cleanUrl.endsWith('/api/recipe')) {
    const ingredients = Array.isArray(data?.ingredients) ? data.ingredients : ['Vegetables', 'Rice'];
    return {
      status: 200,
      statusText: 'OK',
      data: generateDemoRecipe(ingredients)
    };
  }

  // 6. Recipe from Image
  if (cleanUrl.endsWith('/api/recipe-from-image')) {
    const prompt = data?.prompt || 'Fresh ingredients photo';
    return {
      status: 200,
      statusText: 'OK',
      data: {
        reply: `### 📸 Photo Recipe Analysis: Fresh Produce Kitchen Hash\n\nI have analyzed your uploaded kitchen photo. Based on the visible items:\n\n- **Identified Ingredients:** Fresh staples, seasonal vegetables, and kitchen aromatics.\n- **Recommended Dish:** Zero-Waste Sautéed Kitchen Hash\n- **Prep Time:** 10 mins | **Cook Time:** 12 mins | **Budget:** ~₹40\n\n#### Instructions:\n1. Dice all visible vegetables uniformly for even cooking.\n2. Sauté with 1 tsp oil, pinch of turmeric, salt, and cumin seeds until tender.\n3. Serve warm with roti, rice, or toasted bread.\n\n💡 *Zero-Waste Tip: Use vegetable peelings to enrich vegetable stocks.*`,
        followUps: [
          "How long can I store this cooked dish?",
          "Can I add eggs or lentils to increase protein?",
          "What spices pair best with these vegetables?"
        ],
        model: "NutriZero Multimodal Demo Engine",
        provider: "NutriZero AI"
      }
    };
  }

  // 7. Budget Meal Plan
  if (cleanUrl.endsWith('/api/meal-plan')) {
    const budget = data?.budget || '₹150';
    const people = data?.people || 1;
    const diet = data?.diet || 'Vegetarian';
    return {
      status: 200,
      statusText: 'OK',
      data: generateDemoMealPlan(budget, people, diet)
    };
  }

  // 8. Food Waste Reducer
  if (cleanUrl.endsWith('/api/food-waste')) {
    const leftover = data?.leftover || 'leftover food';
    return {
      status: 200,
      statusText: 'OK',
      data: generateDemoFoodWaste(leftover)
    };
  }

  // 9. Grocery Planner
  if (cleanUrl.endsWith('/api/grocery-plan')) {
    const budget = data?.budget || '₹500';
    const people = data?.people || 2;
    const preferences = data?.preferences || 'Affordable nutritious staples';
    return {
      status: 200,
      statusText: 'OK',
      data: generateDemoGroceryPlan(budget, people, preferences)
    };
  }

  // 10. Chat Endpoint
  if (cleanUrl.endsWith('/api/chat')) {
    const message = data?.message || '';
    const history = data?.history || [];

    // Check if user has an optional direct Gemini API key saved in browser
    const liveAiText = await tryDirectGeminiApi(message, history);
    if (liveAiText) {
      return {
        status: 200,
        statusText: 'OK',
        data: {
          reply: liveAiText,
          followUps: [
            "Tell me more details about this",
            "How does this relate to SDG 2 Zero Hunger?",
            "Give me a budget-friendly shopping tip"
          ],
          model: "gemini-1.5-flash (Live API)",
          provider: "Google Gemini"
        }
      };
    }

    return {
      status: 200,
      statusText: 'OK',
      data: generateDemoChatResponse(message)
    };
  }

  // Default fallback response
  return {
    status: 200,
    statusText: 'OK',
    data: {
      message: "Request processed by NutriZero Demo Service",
      status: "ok"
    }
  };
}
