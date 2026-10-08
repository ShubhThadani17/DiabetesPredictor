from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import PatientInput, PredictionResponse
from model_utils import run_prediction

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://diabetes-predictor-agent.vercel.app"],
    allow_methods=["POST"],
    allow_headers=["*"],
)


@app.get("/")
def check():
    return {"Status": "OK"}


@app.post("/predict", response_model=PredictionResponse) #checks outgoing data
def predict(data: PatientInput): #8 values packed in data object
    try:
        prediction, probability, top_factors = run_prediction([
            data.pregnancies, data.glucose, data.blood_pressure,
            data.skin_thickness, data.insulin, data.bmi,
            data.diabetes_pedigree_function, data.age
        ])
    except Exception:
        raise HTTPException(status_code=500, detail="Prediction failed. Please check the input data.") #custom error message

    return PredictionResponse(
        prediction=prediction,
        risk_label="At risk" if prediction == 1 else "Low risk",
        probability=round(probability, 3),
        top_factors=top_factors
    )