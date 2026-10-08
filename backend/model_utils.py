import joblib
import pandas as pd
import shap #library that explains why the model gave a particular prediction

FEATURE_NAMES = [
    "Pregnancies", "Glucose", "BloodPressure", "SkinThickness","Insulin", "BMI", "DiabetesPedigreeFunction", "Age"
] #8 columns of the Pima diabetes dataset

#load saved files
ensemble = joblib.load("artifacts/diabetes_ensemble.joblib")
background = joblib.load("artifacts/shap_background.joblib")

#helper that takes raw data, wraps it in a DataFrame
func = lambda data: ensemble.predict_proba(pd.DataFrame(data, columns=FEATURE_NAMES))[:, 1] #gives probability , all rows, column 1
explainer = shap.KernelExplainer(func, background) #returns predictions


def run_prediction(features: list):
    sample = pd.DataFrame([features], columns=FEATURE_NAMES) #create a DataFrame with one row

    prediction = int(ensemble.predict(sample)[0])
    probability = float(ensemble.predict_proba(sample)[0, 1])

    sv = explainer.shap_values(sample) #returns one number per feature
    contributions = sv[0] #takes the first patient’s row, giving 8 numbers

    ranked = sorted(
        zip(FEATURE_NAMES, contributions),
        key=lambda x: abs(x[1]), #sorts by the size of the impact
        reverse=True
    )[:4]

    top_factors = [
        {
            "feature": name,
            "impact": round(float(val), 3),
            "direction": "increases risk" if val > 0 else "decreases risk"
        } #turns each pair into a dictionary
        for name, val in ranked
    ]

    return prediction, probability, top_factors