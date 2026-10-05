# Diabetes Risk Predictor

A full stack machine learning web app that predicts diabetes risk from patient health metrics, built for Project Exhibition I (B.Tech CSE Core, VIT Bhopal).

**Live site**: _<!-- add deployed Vercel/Render link here -->_

**Team No. 19**
- Shubh Thadani
- Parth Shende
- Atharva Uday Desai
- Gandem Vankata Sai Prathik
- Aarushi Raizada

---

## What It Does

Takes 8 standard clinical measurements (glucose, BMI, blood pressure, age, etc.) and returns:
1. A risk prediction (At risk / Low risk)
2. A probability score
3. The top features (via SHAP) that drove that specific patient's prediction

## Why This Project

Most student projects on this dataset stop at "train one model, report accuracy." This one is built around four gaps identified in the reviewed literature (baseline paper: Nauman et al. 2025, IEEE Access) that most PIMA-based projects skip:

| Gap in prior work | What this project does |
|---|---|
| No class imbalance handling | SMOTE applied inside the training pipeline (training folds only) |
| No hyperparameter tuning | GridSearchCV (5-fold CV, scored by F1) tunes the SVM component |
| No explainability | SHAP returns per-patient feature contributions, not just a yes/no |
| No ensembling | Final model is a soft-voting ensemble of tuned SVM + Random Forest + MLP |

## Tech Stack

**ML**
- Python, pandas, numpy, scikit-learn
- imbalanced-learn (SMOTE)
- shap (KernelExplainer)
- Trained and exported in Google Colab

**Backend**
- FastAPI
- Pydantic (request validation)
- Uvicorn
- joblib (model loading)

**Frontend**
- HTML, CSS, JavaScript
- Vite (build tool), Bun (package manager)
- Deployed on Vercel

## Dataset

[PIMA Indians Diabetes Dataset](https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database), 768 patient records, 8 features:

Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, BMI, DiabetesPedigreeFunction, Age

## Project Structure

```
.
├── ml/
│   └── diaresearch.ipynb
├── backend/
│   ├── main.py
│   ├── schemas.py
│   ├── model_utils.py
│   ├── requirements.txt
│   └── artifacts/
│       ├── diabetes_ensemble.joblib
│       └── shap_background.joblib
└── frontend/
    ├── index.html
    ├── app.js
    ├── style.css
    ├── package.json
    ├── bun.lock
    ├── vite.config.ts
    └── tsconfig.json
```

## Running Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`.

### Frontend

Built with Vite, so it needs a build step, opening `index.html` directly will not work correctly.

```bash
cd frontend
bun install
bun run dev
```

Update the `API_URL` constant in `app.js` to point at your backend (`http://localhost:8000/predict` for local, or the deployed backend URL otherwise).

## Model Performance

Evaluated on a held-out test set:

| Metric | Score |
|---|---|
| Accuracy | 0.72 |
| ROC-AUC | 0.83 |

Note: a plain SVM baseline without SMOTE scored higher raw accuracy (0.77), but caught fewer actual diabetic cases (recall 0.48). The ensemble trades a small amount of accuracy for meaningfully better recall on diabetic patients (0.63), which matters more for a screening tool than raw accuracy alone.

## API

### `POST /predict`

**Request**
```json
{
  "pregnancies": 2,
  "glucose": 197,
  "blood_pressure": 70,
  "skin_thickness": 45,
  "insulin": 543,
  "bmi": 30.5,
  "diabetes_pedigree_function": 0.158,
  "age": 53
}
```

**Response**
```json
{
  "prediction": 1,
  "risk_label": "At risk",
  "probability": 0.95,
  "top_factors": [
    { "feature": "Glucose", "impact": 0.31, "direction": "increases risk" },
    { "feature": "BMI", "impact": 0.18, "direction": "increases risk" }
  ]
}
```

## Limitations

- PIMA is a small (768 rows), single-population dataset; results may not generalize to broader populations
- Not validated on an external/independent dataset
- Not a diagnostic tool, this is a screening estimate only, built for an academic exhibition, not clinical use

## License

Academic project, built for coursework. Not licensed for clinical or commercial use.