from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from io import BytesIO
from datetime import datetime

# database path
DB_PATH = os.path.join(os.path.dirname(__file__), "users.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute(
        """CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )"""
    )
    conn.execute(
        """CREATE TABLE IF NOT EXISTS health_tracking(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            weight REAL,
            height REAL,
            bmi REAL,
            activity_level TEXT,
            goal TEXT,
            skin_disease BOOLEAN DEFAULT 0,
            allergies TEXT,
            foods_suggested TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id, date)
        )"""
    )
    conn.execute(
        """CREATE TABLE IF NOT EXISTS lifestyle_tracking(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            wake_up_time TEXT,
            breakfast_time TEXT,
            breakfast_type TEXT,
            lunch_time TEXT,
            lunch_type TEXT,
            dinner_time TEXT,
            dinner_type TEXT,
            exercise_time TEXT,
            exercise_type TEXT,
            exercise_duration INTEGER,
            exercise_frequency TEXT,
            bedtime TEXT,
            sleep_hours REAL,
            sleep_quality TEXT,
            water_intake INTEGER,
            steps_count INTEGER,
            mood TEXT,
            notes TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id, date)
        )"""
    )
    conn.commit()
    conn.close()

# ensure database exists
init_db()

# serve the static frontend directory so the browser loads the HTML from the same origin
app = Flask(__name__, static_folder="frontend", static_url_path="")
CORS(app)   # allows requests from the browser (including when origin is null/file://)

# Global error handler
@app.errorhandler(Exception)
def handle_error(error):
    """Handle all unhandled exceptions"""
    return jsonify(error=f"Server error: {str(error)}"), 500

# ----------------------------
# BMI Calculation Function
# ----------------------------
def calculate_bmi(weight, height):
    height_m = height / 100
    bmi = weight / (height_m ** 2)
    return round(bmi, 2)

# ----------------------------
# BMI Category Function
# ----------------------------
def bmi_category(bmi):
    if bmi < 18.5:
        return "Underweight"
    elif 18.5 <= bmi < 25:
        return "Normal weight"
    elif 25 <= bmi < 30:
        return "Overweight"
    else:
        return "Obese"

# ----------------------------
# Food Database with Nutritional Info
# ----------------------------
FOOD_DATABASE = {
    "proteins": [
        {"name": "Grilled Chicken Breast", "calories": 165, "protein": 31, "carbs": 0, "fat": 3.6, "category": "lean protein"},
        {"name": "Salmon", "calories": 208, "protein": 20, "carbs": 0, "fat": 13, "category": "fatty fish"},
        {"name": "Eggs", "calories": 155, "protein": 13, "carbs": 1.1, "fat": 11, "category": "whole egg"},
        {"name": "Tuna", "calories": 132, "protein": 28, "carbs": 0, "fat": 1, "category": "lean fish"},
        {"name": "Turkey Breast", "calories": 135, "protein": 30, "carbs": 0, "fat": 1, "category": "lean protein"},
        {"name": "Greek Yogurt", "calories": 100, "protein": 17, "carbs": 6, "fat": 0.7, "category": "dairy"},
        {"name": "Cottage Cheese", "calories": 98, "protein": 11, "carbs": 3.4, "fat": 4.3, "category": "dairy"},
        {"name": "Tofu", "calories": 76, "protein": 8, "carbs": 1.9, "fat": 4.8, "category": "plant protein"},
        {"name": "Lentils", "calories": 116, "protein": 9, "carbs": 20, "fat": 0.4, "category": "legumes"},
        {"name": "Black Beans", "calories": 132, "protein": 8.9, "carbs": 23.7, "fat": 0.5, "category": "legumes"},
    ],
    "carbohydrates": [
        {"name": "Brown Rice", "calories": 111, "protein": 2.6, "carbs": 23, "fat": 0.9, "category": "whole grain"},
        {"name": "Oats", "calories": 68, "protein": 2.4, "carbs": 12, "fat": 1.4, "category": "whole grain"},
        {"name": "Sweet Potatoes", "calories": 86, "protein": 1.6, "carbs": 20, "fat": 0.1, "category": "root vegetable"},
        {"name": "Quinoa", "calories": 120, "protein": 4.4, "carbs": 21, "fat": 1.9, "category": "pseudo-cereal"},
        {"name": "Whole Wheat Bread", "calories": 81, "protein": 4, "carbs": 14, "fat": 1.1, "category": "whole grain"},
        {"name": "Banana", "calories": 89, "protein": 1.1, "carbs": 23, "fat": 0.3, "category": "fruit"},
        {"name": "Apple", "calories": 52, "protein": 0.3, "carbs": 14, "fat": 0.2, "category": "fruit"},
    ],
    "vegetables": [
        {"name": "Broccoli", "calories": 34, "protein": 2.8, "carbs": 7, "fat": 0.4, "category": "cruciferous"},
        {"name": "Spinach", "calories": 23, "protein": 2.9, "carbs": 3.6, "fat": 0.4, "category": "leafy green"},
        {"name": "Carrots", "calories": 41, "protein": 0.9, "carbs": 10, "fat": 0.2, "category": "root vegetable"},
        {"name": "Bell Peppers", "calories": 31, "protein": 1, "carbs": 6, "fat": 0.3, "category": "capsicum"},
        {"name": "Cucumber", "calories": 16, "protein": 0.7, "carbs": 3.6, "fat": 0.1, "category": "cucurbit"},
        {"name": "Tomatoes", "calories": 18, "protein": 0.9, "carbs": 3.9, "fat": 0.2, "category": "nightshade"},
        {"name": "Kale", "calories": 49, "protein": 4.3, "carbs": 8.8, "fat": 0.9, "category": "leafy green"},
        {"name": "Cauliflower", "calories": 25, "protein": 1.9, "carbs": 5, "fat": 0.3, "category": "cruciferous"},
    ],
    "fruits": [
        {"name": "Papaya", "calories": 43, "protein": 0.5, "carbs": 11, "fat": 0.3, "category": "tropical"},
        {"name": "Blueberries", "calories": 57, "protein": 0.7, "carbs": 14, "fat": 0.3, "category": "berry"},
        {"name": "Strawberries", "calories": 32, "protein": 0.7, "carbs": 7.7, "fat": 0.3, "category": "berry"},
        {"name": "Orange", "calories": 47, "protein": 0.9, "carbs": 12, "fat": 0.1, "category": "citrus"},
        {"name": "Mango", "calories": 60, "protein": 0.8, "carbs": 15, "fat": 0.4, "category": "tropical"},
        {"name": "Watermelon", "calories": 30, "protein": 0.6, "carbs": 7.6, "fat": 0.2, "category": "melon"},
    ],
    "healthy_fats": [
        {"name": "Avocado", "calories": 160, "protein": 2, "carbs": 8.5, "fat": 15, "category": "fruit"},
        {"name": "Almonds", "calories": 164, "protein": 6, "carbs": 6, "fat": 14, "category": "nuts"},
        {"name": "Peanut Butter", "calories": 188, "protein": 8, "carbs": 6, "fat": 16, "category": "nut butter"},
        {"name": "Walnuts", "calories": 185, "protein": 4.3, "carbs": 3.9, "fat": 18, "category": "nuts"},
        {"name": "Olive Oil", "calories": 119, "protein": 0, "carbs": 0, "fat": 13.5, "category": "oils"},
        {"name": "Chia Seeds", "calories": 137, "protein": 4.7, "carbs": 12, "fat": 8.7, "category": "seeds"},
    ],
    "snacks": [
        {"name": "Hummus with Veggies", "calories": 166, "protein": 8, "carbs": 14, "fat": 8, "category": "dip"},
        {"name": "Protein Shake", "calories": 120, "protein": 24, "carbs": 3, "fat": 1, "category": "beverage"},
        {"name": "Trail Mix", "calories": 173, "protein": 5, "carbs": 17, "fat": 11, "category": "mix"},
    ]
}


@app.route("/api/foods", methods=["GET"])
def get_food_database():
    """Get the complete food database"""
    return jsonify({
        "success": True,
        "foods": FOOD_DATABASE,
        "categories": list(FOOD_DATABASE.keys())
    })


@app.route("/api/foods/<category>", methods=["GET"])
def get_foods_by_category(category):
    """Get foods by specific category"""
    category = category.lower()
    if category in FOOD_DATABASE:
        return jsonify({
            "success": True,
            "category": category,
            "foods": FOOD_DATABASE[category]
        })
    return jsonify({"error": f"Category '{category}' not found"}), 404


@app.route("/api/food_suggestion", methods=["POST"])
def api_food_suggestion():
    """
    Dedicated food suggestion API endpoint
    Provides detailed nutritional information with recommendations
    """
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify(error="Invalid JSON payload"), 400

    try:
        weight = float(data.get("weight", 0))
        height = float(data.get("height", 0))
    except (ValueError, TypeError):
        return jsonify(error="Weight and height must be numbers"), 400

    if weight <= 0 or height <= 0:
        return jsonify(error="Weight and height must be greater than zero"), 400

    # Get parameters
    activity = data.get("activity", "medium").lower()
    goal = data.get("goal", "maintain").lower()
    skin_disease = data.get("skin_disease", False)
    allergies = data.get("allergies", [])
    dietary_preference = data.get("diet", "balanced")  # balanced, vegetarian, vegan

    # Calculate BMI
    bmi = calculate_bmi(weight, height)
    category = bmi_category(bmi)

    # Normalize goal
    if goal in ["lose", "weight loss"]:
        goal = "weight loss"
    elif goal in ["gain", "muscle gain"]:
        goal = "muscle gain"
    else:
        goal = "maintenance"

    # Normalize activity
    if activity in ["sedentary", "low"]:
        activity = "low"
    elif activity in ["light", "medium"]:
        activity = "medium"
    else:
        activity = "high"

    # Generate suggestions based on goal
    suggestions = []
    total_nutrition = {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}

    if goal == "weight loss":
        # Low calorie, high protein foods
        for food in FOOD_DATABASE["proteins"][:3]:
            if not _is_allergic(food["name"], allergies):
                suggestions.append(food)
        for food in FOOD_DATABASE["vegetables"][:3]:
            if not _is_allergic(food["name"], allergies):
                suggestions.append(food)
        for food in FOOD_DATABASE["fruits"][:2]:
            if not _is_allergic(food["name"], allergies):
                suggestions.append(food)

    elif goal == "muscle gain":
        # High protein, high calorie foods
        for food in FOOD_DATABASE["proteins"]:
            if not _is_allergic(food["name"], allergies):
                suggestions.append(food)
        for food in FOOD_DATABASE["carbohydrates"][:3]:
            if not _is_allergic(food["name"], allergies):
                suggestions.append(food)
        for food in FOOD_DATABASE["healthy_fats"][:2]:
            if not _is_allergic(food["name"], allergies):
                suggestions.append(food)

    else:  # maintenance
        # Balanced mix
        for food in FOOD_DATABASE["proteins"][:2]:
            if not _is_allergic(food["name"], allergies):
                suggestions.append(food)
        for food in FOOD_DATABASE["carbohydrates"][:2]:
            if not _is_allergic(food["name"], allergies):
                suggestions.append(food)
        for food in FOOD_DATABASE["vegetables"][:2]:
            if not _is_allergic(food["name"], allergies):
                suggestions.append(food)
        for food in FOOD_DATABASE["fruits"][:2]:
            if not _is_allergic(food["name"], allergies):
                suggestions.append(food)

    # Filter based on skin disease
    if skin_disease:
        suggestions = [f for f in suggestions if f["name"] not in [
            "Greek Yogurt", "Cottage Cheese", "Milk / Protein shake", "Peanut Butter"
        ]]

    # Calculate total nutrition
    for food in suggestions:
        total_nutrition["calories"] += food["calories"]
        total_nutrition["protein"] += food["protein"]
        total_nutrition["carbs"] += food["carbs"]
        total_nutrition["fat"] += food["fat"]

    # Build response
    response = {
        "success": True,
        "user_data": {
            "weight": weight,
            "height": height,
            "bmi": bmi,
            "bmi_category": category,
            "goal": goal,
            "activity_level": activity
        },
        "suggestions": suggestions,
        "total_nutrition": {k: round(v, 1) for k, v in total_nutrition.items()},
        "meals": {
            "breakfast": _suggest_meal(suggestions, "breakfast", allergies),
            "lunch": _suggest_meal(suggestions, "lunch", allergies),
            "dinner": _suggest_meal(suggestions, "dinner", allergies)
        },
        "tips": _get_nutrition_tips(goal, category, activity)
    }

    return jsonify(response)


def _is_allergic(food_name, allergies):
    """Check if food triggers any allergy"""
    if not allergies:
        return False
    
    allergy_keywords = {
        "dairy": ["yogurt", "cheese", "milk", "cottage"],
        "nuts": ["almond", "walnut", "peanut", "cashew"],
        "egg": ["egg"],
        "gluten": ["bread", "wheat", "oat", "quinoa"],
        "soy": ["tofu", "soy"],
        "fish": ["salmon", "tuna", "fish"],
        "shellfish": ["shrimp", "crab", "lobster"]
    }
    
    food_lower = food_name.lower()
    for allergy in allergies:
        allergy = allergy.lower().strip()
        if allergy in allergy_keywords:
            for keyword in allergy_keywords[allergy]:
                if keyword in food_lower:
                    return True
    return False


def _suggest_meal(foods, meal_type, allergies):
    """Suggest foods for a specific meal"""
    meal_suggestions = []
    for food in foods[:4]:
        if not _is_allergic(food["name"], allergies):
            meal_suggestions.append(food["name"])
    return meal_suggestions


def _get_nutrition_tips(goal, bmi_category, activity):
    """Get nutrition tips based on user profile"""
    tips = []
    
    if goal == "weight loss":
        tips.append("🥗 Aim for 300-500 calorie deficit daily")
        tips.append("💧 Drink 2-3 liters of water per day")
        tips.append("🥬 Fill half your plate with vegetables")
    
    elif goal == "muscle gain":
        tips.append("🍗 Consume 1.6-2.2g protein per kg body weight")
        tips.append("🥔 Include complex carbs for energy")
        tips.append("💪 Eat within 2 hours of workout")
    
    else:
        tips.append("⚖️ Maintain balanced macronutrients")
        tips.append("🥘 Include variety in your diet")
        tips.append("📊 Track your portions")
    
    if bmi_category == "Underweight":
        tips.append("📈 Increase calorie intake with healthy fats")
        tips.append("🥜 Add nuts and seeds to meals")
    
    elif bmi_category in ["Overweight", "Obese"]:
        tips.append("🚫 Reduce processed foods and sugars")
        tips.append("🏃 Increase physical activity")
    
    if activity == "high":
        tips.append("⚡ Increase carbohydrate intake for energy")
        tips.append("💧 Stay extra hydrated")
    
    return tips
def suggest_food(goal, category, activity, skin_disease=False, allergies=None):
    """Produce a list of foods based on the user's goal, BMI category, and
    activity level.  If an unknown activity string is received, the function
    simply skips that adjustment instead of raising an error.

    Parameters are case-insensitive; they will be lowercased internally.
    """

    # normalize inputs
    goal = goal.lower().strip()
    category = category.lower()
    activity = activity.lower().strip()
    if allergies is None:
        allergies = []
    else:
        allergies = [a.lower().strip() for a in allergies]

    # Normalize goal values - handle both formats
    # Web sends: "weight loss", "muscle gain", "maintenance"
    # Mobile sends: "lose", "gain", "maintain"
    if goal == "lose":
        goal = "weight loss"
    elif goal == "gain":
        goal = "muscle gain"
    elif goal == "maintain":
        goal = "maintenance"

    # Normalize activity values - handle both formats
    # Web sends: "low", "medium", "high"
    # Mobile sends: "sedentary", "light", "moderate", "very_active"
    if activity in ["sedentary", "low"]:
        activity = "low"
    elif activity in ["light", "medium"]:
        activity = "medium"
    elif activity in ["moderate", "very_active", "active", "high"]:
        activity = "high"

    suggestions = []

    if goal == "weight loss":
        suggestions = [
            "Grilled chicken / fish",
            "Green vegetables",
            "Oats / Brown rice",
            "Fruits (apple, papaya)",
            "Low-fat yogurt",
        ]

    elif goal == "muscle gain":
        suggestions = [
            "Eggs",
            "Chicken breast",
            "Rice / Sweet potatoes",
            "Milk / Protein shake",
            "Peanut butter",
        ]

    elif goal == "maintenance":
        suggestions = [
            "Balanced diet",
            "Vegetables + Protein",
            "Whole grains",
            "Fruits",
            "Adequate water",
        ]

    # BMI adjustment
    if category == "underweight":
        suggestions.append("Increase calorie intake (nuts, dates, milk)")
    elif category in ["overweight", "obese"]:
        suggestions.append("Reduce sugar & fried foods")

    # Activity adjustment
    if activity == "high":
        suggestions.append("Increase protein & hydration")
    elif activity == "low":
        suggestions.append("Control calorie intake")
    # 'medium' or any other value: no special advice beyond the base list

    # Filter out foods based on skin disease
    if skin_disease:
        skin_disease_avoid = ["Low-fat yogurt", "Milk / Protein shake", "Peanut butter", "Reduce sugar & fried foods"]
        suggestions = [food for food in suggestions if food not in skin_disease_avoid]

    # Filter out foods based on allergies
    if allergies:
        allergy_filters = {
            "dairy": ["Low-fat yogurt", "Milk / Protein shake", "Increase calorie intake (nuts, dates, milk)"],
            "nuts": ["Peanut butter", "Increase calorie intake (nuts, dates, milk)"],
            "peanut": ["Peanut butter", "Increase calorie intake (nuts, dates, milk)"],
            "milk": ["Low-fat yogurt", "Milk / Protein shake", "Increase calorie intake (nuts, dates, milk)"],
            "egg": ["Eggs"],
            "eggs": ["Eggs"],
            "chicken": ["Grilled chicken / fish", "Chicken breast"],
            "fish": ["Grilled chicken / fish"],
            "gluten": ["Oats / Brown rice", "Whole grains", "Rice / Sweet potatoes"],
            "wheat": ["Oats / Brown rice", "Whole grains"]
        }

        suggestions = [food for food in suggestions if not any(
            allergy in allergy_filters and food in allergy_filters[allergy]
            for allergy in allergies
        )]

    return suggestions


# ----------------------------
# API ROUTE (Connected to HTML)
# ----------------------------
@app.route("/calculate", methods=["POST"])
def calculate():
    # validate JSON payload and convert types; return appropriate 400 errors
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify(error="Invalid JSON payload"), 400

    try:
        age = int(data.get("age", 0))
        weight = float(data.get("weight", 0))
        height = float(data.get("height", 0))
    except (ValueError, TypeError):
        return jsonify(error="Age, weight and height must be numbers"), 400

    # simple range checks
    if weight <= 0 or height <= 0:
        return jsonify(error="Weight and height must be greater than zero"), 400
    if age < 0:
        return jsonify(error="Age must be non-negative"), 400

    activity = data.get("activity", "").lower()
    goal = data.get("goal", "").lower()
    skin_disease = data.get("skin_disease", False)
    allergies = data.get("allergies", [])
    if isinstance(allergies, str):
        allergies = [a.strip() for a in allergies.split(",") if a.strip()]

    bmi = calculate_bmi(weight, height)
    category = bmi_category(bmi)  # keep standard capitalization for response
    foods = suggest_food(goal, category, activity, skin_disease, allergies)

    return jsonify({
        "age": age,
        "bmi": bmi,
        "category": category,
        "foods": foods,
    })


# ----------------------------
# Authentication routes
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json(force=True)
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify(error="All fields required"), 400
    if len(password) < 6:
        return jsonify(error="Password must be at least 6 characters"), 400

    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            (name, email, generate_password_hash(password)),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify(error="Email already registered"), 400
    conn.close()

    return jsonify(success=True, name=name, email=email)


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(force=True)
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify(error="Email and password required"), 400

    conn = get_db()
    row = conn.execute("SELECT name, email, password_hash FROM users WHERE email=?", (email,)).fetchone()
    conn.close()
    if not row or not check_password_hash(row["password_hash"], password):
        return jsonify(error="Invalid email or password"), 400

    return jsonify(success=True, name=row["name"], email=row["email"])


# ----------------------------
# Health Tracking API Routes
# ----------------------------
@app.route("/save_health_data", methods=["POST"])
def save_health_data():
    data = request.get_json(force=True)
    email = data.get("email", "").strip().lower()

    if not email:
        return jsonify(error="Email required"), 400

    # Get user ID
    conn = get_db()
    user_row = conn.execute("SELECT id FROM users WHERE email=?", (email,)).fetchone()
    if not user_row:
        conn.close()
        return jsonify(error="User not found"), 404

    user_id = user_row["id"]

    # Extract health data
    date = data.get("date", "")
    weight = data.get("weight")
    height = data.get("height")
    activity = data.get("activity", "")
    goal = data.get("goal", "")
    skin_disease = data.get("skin_disease", False)
    allergies = data.get("allergies", [])
    foods_suggested = data.get("foods_suggested", [])

    if isinstance(allergies, list):
        allergies = ",".join(allergies)
    if isinstance(foods_suggested, list):
        foods_suggested = ",".join(foods_suggested)

    # Calculate BMI if weight and height provided
    bmi = None
    if weight and height:
        bmi = calculate_bmi(float(weight), float(height))

    try:
        conn.execute(
            """INSERT OR REPLACE INTO health_tracking
               (user_id, date, weight, height, bmi, activity_level, goal, skin_disease, allergies, foods_suggested)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (user_id, date, weight, height, bmi, activity, goal, skin_disease, allergies, foods_suggested)
        )
        conn.commit()
    except Exception as e:
        conn.close()
        return jsonify(error=f"Database error: {str(e)}"), 500

    conn.close()
    return jsonify(success=True, message="Health data saved successfully")


@app.route("/get_health_history", methods=["GET"])
def get_health_history():
    email = request.args.get("email", "").strip().lower()

    if not email:
        return jsonify(error="Email required"), 400

    # Get user ID
    conn = get_db()
    user_row = conn.execute("SELECT id FROM users WHERE email=?", (email,)).fetchone()
    if not user_row:
        conn.close()
        return jsonify(error="User not found"), 404

    user_id = user_row["id"]

    # Get health history
    rows = conn.execute(
        """SELECT date, weight, height, bmi, activity_level, goal, skin_disease, allergies, foods_suggested
           FROM health_tracking
           WHERE user_id = ?
           ORDER BY date DESC""",
        (user_id,)
    ).fetchall()

    health_history = []
    for row in rows:
        health_history.append({
            "date": row["date"],
            "weight": row["weight"],
            "height": row["height"],
            "bmi": row["bmi"],
            "activity_level": row["activity_level"],
            "goal": row["goal"],
            "skin_disease": bool(row["skin_disease"]),
            "allergies": row["allergies"].split(",") if row["allergies"] else [],
            "foods_suggested": row["foods_suggested"].split(",") if row["foods_suggested"] else []
        })

    conn.close()
    return jsonify(health_history=health_history)


@app.route("/get_health_insights", methods=["GET"])
def get_health_insights():
    email = request.args.get("email", "").strip().lower()

    if not email:
        return jsonify(error="Email required"), 400

    # Get user ID
    conn = get_db()
    user_row = conn.execute("SELECT id FROM users WHERE email=?", (email,)).fetchone()
    if not user_row:
        conn.close()
        return jsonify(error="User not found"), 404

    user_id = user_row["id"]

    # Get recent health data for insights
    rows = conn.execute(
        """SELECT date, weight, bmi, goal
           FROM health_tracking
           WHERE user_id = ?
           ORDER BY date DESC
           LIMIT 30""",
        (user_id,)
    ).fetchall()

    if len(rows) < 2:
        conn.close()
        return jsonify(insights=["Not enough data for insights. Track your health for at least 2 days."])

    insights = []
    data_points = [{"date": row["date"], "weight": row["weight"], "bmi": row["bmi"], "goal": row["goal"]} for row in rows]
    data_points.reverse()  # Oldest first

    # Weight trend analysis
    if data_points[0]["weight"] and data_points[-1]["weight"]:
        weight_change = data_points[-1]["weight"] - data_points[0]["weight"]
        if abs(weight_change) > 0.1:
            direction = "gained" if weight_change > 0 else "lost"
            insights.append(f"You have {direction} {abs(weight_change):.1f}kg over {len(data_points)} days.")

    # BMI trend analysis
    if data_points[0]["bmi"] and data_points[-1]["bmi"]:
        bmi_change = data_points[-1]["bmi"] - data_points[0]["bmi"]
        if abs(bmi_change) > 0.1:
            if bmi_change > 0:
                insights.append("Your BMI has increased. Consider adjusting your diet or exercise routine.")
            else:
                insights.append("Great progress! Your BMI has decreased. Keep up the good work!")

    # Goal consistency
    goals = [dp["goal"] for dp in data_points if dp["goal"]]
    if goals:
        most_common_goal = max(set(goals), key=goals.count)
        consistency = goals.count(most_common_goal) / len(goals) * 100
        if consistency >= 80:
            insights.append(f"Excellent consistency with your {most_common_goal} goal ({consistency:.0f}% of the time)!")
        elif consistency >= 60:
            insights.append(f"Good consistency with your {most_common_goal} goal ({consistency:.0f}% of the time).")

    # Weekly progress suggestions
    if len(data_points) >= 7:
        weekly_avg = sum(dp["weight"] for dp in data_points[-7:] if dp["weight"]) / 7
        if data_points[-1]["weight"] and weekly_avg:
            if data_points[-1]["goal"] == "weight loss" and data_points[-1]["weight"] > weekly_avg:
                insights.append("Consider increasing your activity level or reducing calorie intake for better weight loss results.")
            elif data_points[-1]["goal"] == "muscle gain" and data_points[-1]["weight"] < weekly_avg:
                insights.append("Focus on protein-rich foods and strength training to support muscle gain goals.")

    if not insights:
        insights.append("Keep tracking your health data regularly for personalized insights!")

    conn.close()
    return jsonify(insights=insights)


# ----------------------------
# Lifestyle Tracking API Routes
# ----------------------------
@app.route("/save_lifestyle_data", methods=["POST"])
def save_lifestyle_data():
    data = request.get_json(force=True)
    email = data.get("email", "").strip().lower()

    if not email:
        return jsonify(error="Email required"), 400

    # Get user ID
    conn = get_db()
    user_row = conn.execute("SELECT id FROM users WHERE email=?", (email,)).fetchone()
    if not user_row:
        conn.close()
        return jsonify(error="User not found"), 404

    user_id = user_row["id"]
    date = data.get("date", "")

    try:
        conn.execute(
            """INSERT OR REPLACE INTO lifestyle_tracking
               (user_id, date, wake_up_time, breakfast_time, breakfast_type, lunch_time, lunch_type,
                dinner_time, dinner_type, exercise_time, exercise_type, exercise_duration, exercise_frequency,
                bedtime, sleep_hours, sleep_quality, water_intake, steps_count, mood, notes)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (user_id, date,
             data.get("wake_up_time", ""),
             data.get("breakfast_time", ""),
             data.get("breakfast_type", ""),
             data.get("lunch_time", ""),
             data.get("lunch_type", ""),
             data.get("dinner_time", ""),
             data.get("dinner_type", ""),
             data.get("exercise_time", ""),
             data.get("exercise_type", ""),
             data.get("exercise_duration", 0),
             data.get("exercise_frequency", ""),
             data.get("bedtime", ""),
             data.get("sleep_hours", 0),
             data.get("sleep_quality", ""),
             data.get("water_intake", 0),
             data.get("steps_count", 0),
             data.get("mood", ""),
             data.get("notes", ""))
        )
        conn.commit()
    except Exception as e:
        conn.close()
        return jsonify(error=f"Database error: {str(e)}"), 500

    conn.close()
    return jsonify(success=True, message="Lifestyle data saved successfully")


@app.route("/get_lifestyle_data", methods=["GET"])
def get_lifestyle_data():
    email = request.args.get("email", "").strip().lower()
    date = request.args.get("date", "")

    if not email:
        return jsonify(error="Email required"), 400

    # Get user ID
    conn = get_db()
    user_row = conn.execute("SELECT id FROM users WHERE email=?", (email,)).fetchone()
    if not user_row:
        conn.close()
        return jsonify(error="User not found"), 404

    user_id = user_row["id"]

    # Get lifestyle data for specific date or latest
    if date:
        row = conn.execute(
            "SELECT * FROM lifestyle_tracking WHERE user_id = ? AND date = ?",
            (user_id, date)
        ).fetchone()
    else:
        row = conn.execute(
            "SELECT * FROM lifestyle_tracking WHERE user_id = ? ORDER BY date DESC LIMIT 1",
            (user_id,)
        ).fetchone()

    conn.close()

    if not row:
        return jsonify(lifestyle_data=None)

    lifestyle_data = {
        "date": row["date"],
        "wake_up_time": row["wake_up_time"],
        "breakfast_time": row["breakfast_time"],
        "breakfast_type": row["breakfast_type"],
        "lunch_time": row["lunch_time"],
        "lunch_type": row["lunch_type"],
        "dinner_time": row["dinner_time"],
        "dinner_type": row["dinner_type"],
        "exercise_time": row["exercise_time"],
        "exercise_type": row["exercise_type"],
        "exercise_duration": row["exercise_duration"],
        "exercise_frequency": row["exercise_frequency"],
        "bedtime": row["bedtime"],
        "sleep_hours": row["sleep_hours"],
        "sleep_quality": row["sleep_quality"],
        "water_intake": row["water_intake"],
        "steps_count": row["steps_count"],
        "mood": row["mood"],
        "notes": row["notes"]
    }

    return jsonify(lifestyle_data=lifestyle_data)


# ----------------------------
# Personalized Recommendations Route
# ----------------------------
@app.route("/get_personalized_recommendations", methods=["GET"])
def get_personalized_recommendations():
    email = request.args.get("email", "").strip().lower()

    if not email:
        return jsonify(error="Email required"), 400

    # Get user ID
    conn = get_db()
    user_row = conn.execute("SELECT id FROM users WHERE email=?", (email,)).fetchone()
    if not user_row:
        conn.close()
        return jsonify(error="User not found"), 404

    user_id = user_row["id"]

    # Get latest health tracking data
    health_data = conn.execute(
        "SELECT weight, height, bmi, activity_level, goal, skin_disease, allergies FROM health_tracking WHERE user_id = ? ORDER BY date DESC LIMIT 1",
        (user_id,)
    ).fetchone()

    # Get latest lifestyle data
    lifestyle_data = conn.execute(
        "SELECT wake_up_time, breakfast_time, lunch_time, dinner_time, exercise_time, bedtime, sleep_hours, exercise_type, exercise_duration FROM lifestyle_tracking WHERE user_id = ? ORDER BY date DESC LIMIT 1",
        (user_id,)
    ).fetchone()

    conn.close()

    if not health_data:
        return jsonify(error="Please fill in your health data first"), 400

    # Extract health info
    bmi = health_data["bmi"]
    category = bmi_category(bmi) if bmi else "Unknown"
    activity = health_data["activity_level"] or "medium"
    goal = health_data["goal"] or "maintenance"
    skin_disease = bool(health_data["skin_disease"])
    allergies = health_data["allergies"].split(",") if health_data["allergies"] else []
    allergies = [a.strip().lower() for a in allergies if a.strip()]

    recommendations = {}

    # ===== SLEEP RECOMMENDATIONS =====
    if lifestyle_data and lifestyle_data["sleep_hours"]:
        current_sleep = float(lifestyle_data["sleep_hours"])
        if current_sleep < 6:
            sleep_rec = "⚠️ You're sleeping less than recommended. Aim for at least 7-8 hours for better health."
        elif current_sleep > 9:
            sleep_rec = "💤 You're sleeping more than recommended. 7-8 hours is optimal. Aim for consistent sleep schedule."
        else:
            sleep_rec = "✅ Great! Your sleep is within recommended range (7-8 hours)."
    else:
        sleep_rec = "🛏️ Recommended: 7-8 hours per night for optimal health and recovery"

    recommendations["sleep"] = {
        "recommendation": sleep_rec,
        "optimal_bedtime": "10:00 PM - 11:00 PM" if goal == "weight loss" else "10:30 PM - 11:00 PM",
        "optimal_wake_time": "6:00 AM - 7:00 AM" if activity == "high" else "7:00 AM - 8:00 AM"
    }

    # ===== MEAL RECOMMENDATIONS =====
    meal_foods = suggest_food(goal, category, activity, skin_disease, allergies)

    # Adjust portion sizes based on goals
    if goal == "weight loss":
        portion_advice = "🍽️ Smaller portions: 200-250g per meal to maintain calorie deficit"
        water_advice = "💧 Drink 2.5-3 liters of water daily"
    elif goal == "muscle gain":
        portion_advice = "🍖 Larger portions: 400-500g per meal for muscle building"
        water_advice = "💧 Drink 3-4 liters of water daily"
    else:
        portion_advice = "🥗 Balanced portions: 300-350g per meal"
        water_advice = "💧 Drink 2-3 liters of water daily"

    recommendations["meals"] = {
        "breakfast": {
            "time": "7:00 AM - 8:00 AM",
            "foods": [f for f in meal_foods if any(x in f.lower() for x in ["egg", "oat", "milk", "cheese", "yogurt", "fruit"])][:3] or meal_foods[:3],
            "portion": portion_advice if goal == "weight loss" else "Protein + Carbs for energy"
        },
        "lunch": {
            "time": "12:00 PM - 1:00 PM",
            "foods": [f for f in meal_foods if any(x in f.lower() for x in ["chicken", "fish", "rice", "vegetable", "grain"])][:3] or meal_foods[:3],
            "portion": "Main meal - Include vegetables and lean protein"
        },
        "dinner": {
            "time": "7:00 PM - 8:00 PM",
            "foods": [f for f in meal_foods if any(x in f.lower() for x in ["vegetable", "fish", "light", "salad"])][:3] or meal_foods[:3],
            "portion": "Light meal - 2-3 hours before sleep"
        },
        "general_advice": portion_advice,
        "water_intake": water_advice
    }

    # ===== EXERCISE RECOMMENDATIONS =====
    if activity == "high":
        exercise_freq = "5-6 days per week"
        duration = "45-60 minutes"
        exercise_type_rec = "Mix of cardio and strength training"
        time_suggest = "Morning (5:30 AM - 6:30 AM) or Evening (5:00 PM - 6:00 PM)"
    elif activity == "medium":
        exercise_freq = "3-4 days per week"
        duration = "30-40 minutes"
        exercise_type_rec = "Balanced cardio and light strength training"
        time_suggest = "Evening (5:00 PM - 6:00 PM) works best for most people"
    else:
        exercise_freq = "3 days per week"
        duration = "20-30 minutes"
        exercise_type_rec = "Light cardio like walking, swimming, or yoga"
        time_suggest = "Early morning or evening as per your schedule"

    if goal == "weight loss":
        exercise_focus = "🏃 Focus on cardio (running, cycling, jumping rope) to burn calories"
    elif goal == "muscle gain":
        exercise_focus = "💪 Focus on strength training with weights for muscle building"
    else:
        exercise_focus = "⚡ Balance between cardio and strength training"

    recommendations["exercise"] = {
        "frequency": exercise_freq,
        "duration_per_session": duration,
        "recommended_time": time_suggest,
        "exercise_type": exercise_type_rec,
        "focus": exercise_focus,
        "recovery": "Rest 7-8 hours between sessions" if activity == "high" else "Rest 6-7 hours between sessions"
    }

    # ===== DAILY ROUTINE SUMMARY =====
    recommendations["daily_routine"] = {
        "wake_up": recommendations["sleep"]["optimal_wake_time"],
        "breakfast": recommendations["meals"]["breakfast"]["time"],
        "lunch": recommendations["meals"]["lunch"]["time"],
        "exercise": f"{time_suggest} ({duration})",
        "dinner": recommendations["meals"]["dinner"]["time"],
        "bedtime": recommendations["sleep"]["optimal_bedtime"],
        "water_intake": recommendations["meals"]["water_intake"]
    }

    # ===== TIPS FOR YOUR GOAL =====
    tips = []
    if goal == "weight loss":
        tips = [
            "📉 Maintain a calorie deficit of 300-500 calories per day",
            "🥗 Include high-protein foods to maintain muscle during weight loss",
            "🚴 Regular cardio helps accelerate fat loss",
            "🌙 Avoid eating 3 hours before bedtime"
        ]
    elif goal == "muscle gain":
        tips = [
            "🍗 Eat in a calorie surplus with adequate protein (1.6-2.2g per kg body weight)",
            "💪 Progressive overload in strength training is key",
            "🥛 Consume protein within 2 hours after workout",
            "😴 Get extra sleep (8-9 hours) during muscle-building phase"
        ]
    else:
        tips = [
            "⚖️ Maintain balanced nutrition with all macronutrients",
            "🥘 Include variety in your diet for different nutrients",
            "🏃 Combine regular exercise with healthy eating",
            "📊 Track your progress consistently"
        ]

    if category in ["overweight", "obese"]:
        tips.append("⚠️ Reduce sugar and fried foods, increase vegetables")
    
    if activity == "high":
        tips.append("💧 Stay extra hydrated with your active lifestyle")

    recommendations["tips"] = tips

    return jsonify(recommendations=recommendations)


# ----------------------------
# AI Chat Endpoint
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True)
    email = data.get("email", "").strip().lower()
    message = data.get("message", "").strip()

    if not email or not message:
        return jsonify(error="Email and message required"), 400

    # very basic response logic (could integrate with real AI later)
    response_text = ""
    lowered = message.lower()
    if "sleep" in lowered:
        response_text = "A regular sleep schedule of 7-8 hours is ideal. Try to go to bed before 11pm and wake up around 6-7am."
    elif "eat" in lowered or "meal" in lowered or "food" in lowered:
        response_text = "Eat balanced meals at regular times: breakfast around 8am, lunch at 1pm, dinner by 8pm. Avoid heavy meals late at night."
    elif "exercise" in lowered or "workout" in lowered:
        response_text = "Aim for 30-60 minutes of exercise most days. Mix cardio and strength training for best results."
    else:
        response_text = "Thanks for sharing! Stay consistent with healthy habits. You can ask me about sleep, meals, or exercise."

    return jsonify(reply=response_text)


# ----------------------------
# PDF Download Endpoint
# ----------------------------
@app.route("/download_recommendations_pdf", methods=["GET"])
def download_recommendations_pdf():
    email = request.args.get("email", "").strip().lower()

    if not email:
        return jsonify(error="Email required"), 400

    # Get user ID
    conn = get_db()
    user_row = conn.execute("SELECT id, name FROM users WHERE email=?", (email,)).fetchone()
    if not user_row:
        conn.close()
        return jsonify(error="User not found"), 404

    user_id = user_row["id"]
    user_name = user_row["name"]

    # Get latest health tracking data
    health_data = conn.execute(
        "SELECT weight, height, bmi, activity_level, goal, skin_disease, allergies FROM health_tracking WHERE user_id = ? ORDER BY date DESC LIMIT 1",
        (user_id,)
    ).fetchone()

    # Get latest lifestyle data
    lifestyle_data = conn.execute(
        "SELECT wake_up_time, breakfast_time, lunch_time, dinner_time, exercise_time, bedtime, sleep_hours, exercise_type, exercise_duration FROM lifestyle_tracking WHERE user_id = ? ORDER BY date DESC LIMIT 1",
        (user_id,)
    ).fetchone()

    conn.close()

    if not health_data:
        return jsonify(error="Please fill in your health data first"), 400

    # Extract health info
    bmi = health_data["bmi"]
    category = bmi_category(bmi) if bmi else "Unknown"
    activity = health_data["activity_level"] or "medium"
    goal = health_data["goal"] or "maintenance"
    skin_disease = bool(health_data["skin_disease"])
    allergies = health_data["allergies"].split(",") if health_data["allergies"] else []
    allergies = [a.strip().lower() for a in allergies if a.strip()]

    # Get recommendations data
    meal_foods = suggest_food(goal, category, activity, skin_disease, allergies)

    # Create PDF
    pdf_buffer = BytesIO()
    doc = SimpleDocTemplate(pdf_buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#2E7D32'),
        spaceAfter=12,
        alignment=1  # center
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#1976D2'),
        spaceAfter=10,
        spaceBefore=10
    )

    # Title
    story.append(Paragraph("🍎 AI-Powered Health Recommendations Report", title_style))
    story.append(Spacer(1, 0.2*inch))

    # User Info
    user_info_data = [
        ["Name:", user_name],
        ["Email:", email],
        ["Report Date:", datetime.now().strftime("%B %d, %Y")]
    ]
    user_table = Table(user_info_data, colWidths=[1.5*inch, 4*inch])
    user_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#E3F2FD')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey)
    ]))
    story.append(user_table)
    story.append(Spacer(1, 0.3*inch))

    # Health Status Section
    story.append(Paragraph("📊 Health Status", heading_style))
    health_data_table = [
        ["Metric", "Value"],
        ["BMI", f"{bmi}"],
        ["BMI Category", category],
        ["Goal", goal.title()],
        ["Activity Level", activity.title()],
        ["Weight", f"{health_data['weight']} kg"],
        ["Height", f"{health_data['height']} cm"]
    ]
    if skin_disease:
        health_data_table.append(["Skin Disease", "Yes"])
    if allergies:
        health_data_table.append(["Allergies", ", ".join(allergies)])

    health_table = Table(health_data_table, colWidths=[2*inch, 3.5*inch])
    health_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2E7D32')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F1F8E9')]),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey)
    ]))
    story.append(health_table)
    story.append(Spacer(1, 0.25*inch))

    # Recommended Foods Section
    story.append(Paragraph("🍽️ Recommended Foods", heading_style))
    foods_text = ", ".join(meal_foods)
    story.append(Paragraph(foods_text, styles['Normal']))
    story.append(Spacer(1, 0.25*inch))

    # Sleep Recommendations
    if lifestyle_data and lifestyle_data["sleep_hours"]:
        current_sleep = float(lifestyle_data["sleep_hours"])
        if current_sleep < 6:
            sleep_rec = "⚠️ You're sleeping less than recommended. Aim for at least 7-8 hours for better health."
        elif current_sleep > 9:
            sleep_rec = "💤 You're sleeping more than recommended. 7-8 hours is optimal."
        else:
            sleep_rec = "✅ Great! Your sleep is within recommended range (7-8 hours)."
    else:
        sleep_rec = "🛏️ Recommended: 7-8 hours per night for optimal health"

    story.append(Paragraph("😴 Sleep Recommendations", heading_style))
    story.append(Paragraph(sleep_rec, styles['Normal']))
    story.append(Spacer(1, 0.1*inch))

    # Exercise Recommendations
    if activity == "high":
        exercise_rec = "🏃 High Activity: 5-6 days per week, 45-60 minutes per session. Mix cardio and strength training."
    elif activity == "medium":
        exercise_rec = "⚡ Medium Activity: 3-4 days per week, 30-40 minutes per session. Balanced cardio and light strength training."
    else:
        exercise_rec = "🚶 Low Activity: 3 days per week, 20-30 minutes per session. Light cardio like walking or yoga."

    story.append(Paragraph("💪 Exercise Recommendations", heading_style))
    story.append(Paragraph(exercise_rec, styles['Normal']))
    story.append(Spacer(1, 0.25*inch))

    # General Tips
    tips = []
    if goal == "weight loss":
        tips = [
            "📉 Maintain a calorie deficit of 300-500 calories per day",
            "🥗 Include high-protein foods to maintain muscle during weight loss",
            "🚴 Regular cardio helps accelerate fat loss",
            "🌙 Avoid eating 3 hours before bedtime"
        ]
    elif goal == "muscle gain":
        tips = [
            "🍗 Eat in a calorie surplus with adequate protein (1.6-2.2g per kg body weight)",
            "💪 Progressive overload in strength training is key",
            "🥛 Consume protein within 2 hours after workout",
            "😴 Get extra sleep (8-9 hours) during muscle-building phase"
        ]
    else:
        tips = [
            "⚖️ Maintain balanced nutrition with all macronutrients",
            "🥘 Include variety in your diet for different nutrients",
            "🏃 Combine regular exercise with healthy eating",
            "📊 Track your progress consistently"
        ]

    if category in ["Overweight", "Obese"]:
        tips.append("⚠️ Reduce sugar and fried foods, increase vegetables")
    
    if activity == "high":
        tips.append("💧 Stay extra hydrated with your active lifestyle")

    story.append(Paragraph("💡 Personalized Tips & Guidelines", heading_style))
    for tip in tips:
        story.append(Paragraph(f"• {tip}", styles['Normal']))

    story.append(Spacer(1, 0.25*inch))
    story.append(Paragraph("⚕️ Medical Disclaimer", heading_style))
    disclaimer = "This report is AI-generated and for informational purposes only. Please consult with a healthcare professional before making significant changes to your diet or exercise routine. Always seek professional medical advice for personalized health recommendations."
    story.append(Paragraph(disclaimer, styles['Normal']))

    # Build PDF
    doc.build(story)
    pdf_buffer.seek(0)

    try:
        # Try newer Flask version first (3.0+)
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"Health_Recommendations_{datetime.now().strftime('%Y%m%d')}.pdf"
        )
    except TypeError:
        # Fallback for older Flask versions
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            attachment_filename=f"Health_Recommendations_{datetime.now().strftime('%Y%m%d')}.pdf"
        )


# ----------------------------
# Serve Frontend at root
@app.route("/")
def root():
    return app.send_static_file("index.html")

# ----------------------------
# Run Server
# ----------------------------
if __name__ == "__main__":
    # listen on all network interfaces (0.0.0.0) so Android phones on same WiFi can access
    import socket
    hostname = socket.gethostname()
    try:
        ip_addr = socket.gethostbyname(hostname)
        print(f"\n🚀 Server running!")
        print(f"📱 Android on same WiFi: http://{ip_addr}:5000")
        print(f"💻 This computer: http://127.0.0.1:5000\n")
    except:
        pass
    app.run(debug=False, host="0.0.0.0", port=5000, use_reloader=False)