# Healthy Food Suggestion System (Basic Prototype)

def calculate_bmi(weight, height):
    height_m = height / 100  # convert cm to meters
    bmi = weight / (height_m ** 2)
    return round(bmi, 2)

def bmi_category(bmi):
    if bmi < 18.5:
        return "Underweight"
    elif 18.5 <= bmi < 25:
        return "Normal weight"
    elif 25 <= bmi < 30:
        return "Overweight"
    else:
        return "Obese"

def suggest_food(goal, category, activity):
    suggestions = []

    if goal == "weight loss":
        suggestions = [
            "Grilled chicken / fish",
            "Green vegetables",
            "Oats / Brown rice",
            "Fruits (apple, papaya)",
            "Low-fat yogurt"
        ]

    elif goal == "muscle gain":
        suggestions = [
            "Eggs",
            "Chicken breast",
            "Rice / Sweet potatoes",
            "Milk / Protein shake",
            "Peanut butter"
        ]

    elif goal == "maintenance":
        suggestions = [
            "Balanced diet",
            "Vegetables + Protein",
            "Whole grains",
            "Fruits",
            "Adequate water"
        ]

    # BMI-based adjustment
    if category == "Underweight":
        suggestions.append("Increase calorie intake (nuts, dates, milk)")
    elif category == "Overweight" or category == "Obese":
        suggestions.append("Reduce sugar & fried foods")

    # Activity-based adjustment
    if activity == "high":
        suggestions.append("Increase protein & hydration")
    elif activity == "low":
        suggestions.append("Control calorie intake")

    return suggestions


# ---- Main Program ----

print("=== AI Healthy Food Suggestion System ===")

age = int(input("Enter your age: "))
weight = float(input("Enter your weight (kg): "))
height = float(input("Enter your height (cm): "))
activity = input("Enter activity level (low / medium / high): ").lower()
goal = input("Enter health goal (weight loss / muscle gain / maintenance): ").lower()

bmi = calculate_bmi(weight, height)
category = bmi_category(bmi)

foods = suggest_food(goal, category, activity)

print("\n===== RESULT =====")
print(f"BMI: {bmi}")
print(f"Category: {category}")
print("\nRecommended Foods:")
for food in foods:
    print(f"- {food}")
