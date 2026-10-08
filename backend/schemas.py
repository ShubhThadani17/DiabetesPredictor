from pydantic import BaseModel, Field


class PatientInput(BaseModel):
    pregnancies: int = Field(ge=0, le=20)
    glucose: float = Field(ge=40, le=250)
    blood_pressure: float = Field(ge=20, le=150)
    skin_thickness: float = Field(ge=5, le=100)
    insulin: float = Field(ge=10, le=900)
    bmi: float = Field(ge=10, le=70)
    diabetes_pedigree_function: float = Field(ge=0.078, le=3)
    age: int = Field(ge=1, le=100)


class Factor(BaseModel):
    feature: str
    impact: float
    direction: str


class PredictionResponse(BaseModel):
    prediction: int
    risk_label: str
    probability: float
    top_factors: list[Factor]