from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import PatientInput, PredictionResponse
from model_utils import run_prediction

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten to the frontend's actual origin before the demo
    allow_methods=["POST"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictionResponse)
def predict(data: PatientInput):
    try:
        prediction, probability, top_factors = run_prediction([
            data.pregnancies, data.glucose, data.blood_pressure,
            data.skin_thickness, data.insulin, data.bmi,
            data.diabetes_pedigree_function, data.age
        ])
    except Exception:
        raise HTTPException(status_code=500, detail="Prediction failed. Check model artifacts.")

    return PredictionResponse(
        prediction=prediction,
        risk_label="At risk" if prediction == 1 else "Low risk",
        probability=round(probability, 3),
        top_factors=top_factors
    )
