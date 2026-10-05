import joblib
import pandas as pd
import shap

FEATURE_NAMES = [
    "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
    "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"
]

ens_pipe = joblib.load("artifacts/diabetes_ensemble.joblib")
background = joblib.load("artifacts/shap_background.joblib")

# Matches the notebook exactly: wrap predict_proba, slice to the
# positive class, rebuild a named DataFrame so the pipeline's fitted
# imputer/scaler don't warn about missing feature names.
f = lambda data: ens_pipe.predict_proba(pd.DataFrame(data, columns=FEATURE_NAMES))[:, 1]
explainer = shap.KernelExplainer(f, background)


def run_prediction(features: list):
    sample = pd.DataFrame([features], columns=FEATURE_NAMES)

    prediction = int(ens_pipe.predict(sample)[0])
    probability = float(ens_pipe.predict_proba(sample)[0, 1])

    # shap_values shape here is (1, 8), a single output per feature,
    # not the 3D structure a multi-class Explainer would give.
    sv = explainer.shap_values(sample)
    contributions = sv[0]

    ranked = sorted(
        zip(FEATURE_NAMES, contributions),
        key=lambda x: abs(x[1]),
        reverse=True
    )[:4]

    top_factors = [
        {
            "feature": name,
            "impact": round(float(val), 3),
            "direction": "increases risk" if val > 0 else "decreases risk"
        }
        for name, val in ranked
    ]

    return prediction, probability, top_factors
