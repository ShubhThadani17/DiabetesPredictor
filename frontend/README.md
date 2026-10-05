# Diabetes Risk Assessment — Frontend Client

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Vanilla JS](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)

A modern, responsive frontend web application for clinical diabetes risk screening and biomarker impact assessment.

The UI is built purely with **HTML5**, **CSS3**, and **Vanilla JavaScript** (zero heavy frontend frameworks) and is configured to consume predictions from an external machine learning backend via standard JSON API requests.

---

## 📁 Repository Structure

```text
├── index.html        # Clean semantic HTML5 markup & intake layout
├── style.css         # Custom responsive CSS styling & ambient theme
├── app.js            # Vanilla JS controller & dynamic biomarker rendering
├── package.json      # Development server scripts
└── README.md         # Project documentation
```

---

## 🔌 API Data Contract

When the user submits the assessment form, the frontend sends a `POST /api/predict` request with the following biomarker payload:

### Request Format
```json
{
  "glucose": 197,
  "insulin": 543,
  "bloodPressure": 70,
  "skinThickness": 45,
  "bmi": 30.5,
  "age": 53,
  "pregnancies": 2,
  "diabetesPedigreeFunction": 0.158,
  "Glucose": 197,
  "Insulin": 543,
  "BloodPressure": 70,
  "SkinThickness": 45,
  "BMI": 30.5,
  "Age": 53,
  "Pregnancies": 2,
  "DiabetesPedigreeFunction": 0.158
}
```

### Expected Response Format
```json
{
  "prediction": 1,
  "risk_label": "High Risk (Diabetic)",
  "probability": 0.95,
  "top_factors": [
    { "feature": "Glucose", "impact": 0.38, "direction": "increases risk" },
    { "feature": "Insulin", "impact": 0.22, "direction": "increases risk" },
    { "feature": "Age", "impact": 0.14, "direction": "increases risk" },
    { "feature": "BMI", "impact": 0.09, "direction": "increases risk" }
  ]
}
```

---

## 🚀 Running the Frontend

```bash
# Install development dependencies
npm install

# Start development server on port 3000
npm run dev
```

The app will be available at `http://localhost:3000`.
