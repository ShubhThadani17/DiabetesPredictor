document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('predictionForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const btnSpinner = document.getElementById('btnSpinner');

  const emptyState = document.getElementById('emptyState');
  const resultState = document.getElementById('resultState');
  const apiAlert = document.getElementById('apiAlert');
  const apiAlertText = document.getElementById('apiAlertText');

  const riskBadge = document.getElementById('riskBadge');
  const probNum = document.getElementById('probNum');
  const needleGroup = document.getElementById('gaugeNeedleGroup');

  const factorsSection = document.getElementById('factorsSection');
  const factorsList = document.getElementById('factorsList');

  const disclaimerBox = document.getElementById('disclaimerBox');
  const disclaimerIcon = document.getElementById('disclaimerIcon');
  const disclaimerText = document.getElementById('disclaimerText');

  const sampleLowRiskBtn = document.getElementById('sampleLowRiskBtn');
  const sampleHighRiskBtn = document.getElementById('sampleHighRiskBtn');

  const inputs = {
    glucose: document.getElementById('glucose'),
    insulin: document.getElementById('insulin'),
    bloodPressure: document.getElementById('bloodPressure'),
    skinThickness: document.getElementById('skinThickness'),
    bmi: document.getElementById('bmi'),
    age: document.getElementById('age'),
    pregnancies: document.getElementById('pregnancies'),
    diabetesPedigreeFunction: document.getElementById('diabetesPedigreeFunction'),
  };

  function populateProfile(data) {
    Object.keys(data).forEach((key) => {
      if (inputs[key]) {
        inputs[key].value = data[key];
      }
    });
    apiAlert?.classList.add('hidden');
  }

  sampleHighRiskBtn?.addEventListener('click', () => {
    populateProfile({
      pregnancies: 2,
      glucose: 197,
      bloodPressure: 70,
      skinThickness: 45,
      insulin: 543,
      bmi: 30.5,
      diabetesPedigreeFunction: 0.158,
      age: 53,
    });
  });

  sampleLowRiskBtn?.addEventListener('click', () => {
    populateProfile({
      pregnancies: 1,
      glucose: 85,
      bloodPressure: 66,
      skinThickness: 23,
      insulin: 54,
      bmi: 22.4,
      diabetesPedigreeFunction: 0.238,
      age: 26,
    });
  });



  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleAssessment();
  });

  async function handleAssessment() {
    const glucose = parseFloat(inputs.glucose.value) || 0;
    const insulin = parseFloat(inputs.insulin.value) || 0;
    const bloodPressure = parseFloat(inputs.bloodPressure.value) || 0;
    const skinThickness = parseFloat(inputs.skinThickness.value) || 0;
    const bmi = parseFloat(inputs.bmi.value) || 0;
    const age = parseInt(inputs.age.value, 10) || 21;
    const pregnancies = parseInt(inputs.pregnancies.value, 10) || 0;
    const diabetesPedigreeFunction = parseFloat(inputs.diabetesPedigreeFunction.value) || 0.1;

    const payload = {
      pregnancies,
      glucose,
      blood_pressure: bloodPressure,
      skin_thickness: skinThickness,
      insulin,
      bmi,
      diabetes_pedigree_function: diabetesPedigreeFunction,
      age,
    };

    setLoading(true);
    apiAlert?.classList.add('hidden');

    const endpoint =
      import.meta.env.VITE_API_URL || '/predict';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Status ${response.status}`);
      }

      const result = await response.json();
      renderAssessment(result);
    } catch (err) {
      resultState.classList.add('hidden');
      emptyState.classList.remove('hidden');

      if (apiAlert && apiAlertText) {
        apiAlertText.textContent = 'The clinical assessment service is temporarily unavailable. Please ensure the backend prediction service is connected.';
        apiAlert.classList.remove('hidden');
      }
    } finally {
      setLoading(false);
    }
  }

  function setLoading(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      btnText.textContent = 'Evaluating Biomarkers...';
      btnSpinner.classList.remove('hidden');
    } else {
      submitBtn.disabled = false;
      btnText.textContent = 'Assess Risk';
      btnSpinner.classList.add('hidden');
    }
  }

  function renderAssessment(data) {
    apiAlert?.classList.add('hidden');
    emptyState.classList.add('hidden');
    resultState.classList.remove('hidden');

    let prob = 0.5;
    if (typeof data.probability === 'number') {
      prob = data.probability;
    } else if (typeof data.prob === 'number') {
      prob = data.prob;
    } else if (typeof data.diabetic_probability === 'number') {
      prob = data.diabetic_probability;
    } else if (typeof data.p === 'number') {
      prob = data.p;
    }

    const isHighRisk = typeof data.prediction === 'number'
      ? data.prediction === 1
      : (data.prediction === true || prob >= 0.5);

    const probPercentage = (prob * 100).toFixed(1);
    probNum.textContent = `${probPercentage}%`;

    riskBadge.className = 'risk-badge';
    if (isHighRisk) {
      riskBadge.classList.add('at-risk');
      riskBadge.textContent = data.risk_label || data.label || 'High Risk (Diabetic)';
    } else {
      riskBadge.classList.add('low-risk');
      riskBadge.textContent = data.risk_label || data.label || 'Low Risk (Non-Diabetic)';
    }

    const rotationDegrees = Math.min(180, Math.max(0, prob * 180));
    if (needleGroup) {
      needleGroup.style.transform = `rotate(${rotationDegrees}deg)`;
    }

    const rawFactors = data.top_factors || data.shap_values || data.factors || [];
    renderFactors(rawFactors);
    updateDisclaimer(isHighRisk);
  }

  function renderFactors(factors) {
    if (!factors || !Array.isArray(factors) || factors.length === 0) {
      factorsSection.style.display = 'none';
      return;
    }

    factorsSection.style.display = 'block';
    factorsList.innerHTML = '';

    const normalized = factors.map((item) => {
      if (typeof item === 'string') {
        return { feature: item, impact: 0.1, direction: 'increases risk' };
      }
      const feature = item.feature || item.name || item.biomarker || 'Biomarker';
      let impact = 0;
      if (typeof item.impact === 'number') {
        impact = item.impact;
      } else if (typeof item.shap_value === 'number') {
        impact = item.shap_value;
      } else if (typeof item.weight === 'number') {
        impact = item.weight;
      }

      let direction = item.direction;
      if (!direction) {
        direction = impact >= 0 ? 'increases risk' : 'decreases risk';
      }

      return {
        feature,
        impact,
        absImpact: Math.abs(impact),
        direction: direction.toLowerCase(),
      };
    });

    const maxImpact = Math.max(...normalized.map((f) => f.absImpact || 0.01), 0.05);

    normalized.forEach((factor) => {
      const isIncrease = factor.direction.includes('increase') || factor.impact > 0;
      const relativePercent = Math.min(100, Math.max(12, Math.round((factor.absImpact / maxImpact) * 100)));

      const row = document.createElement('div');
      row.className = 'factor-row';

      row.innerHTML = `
        <div class="factor-row-meta">
          <div class="factor-name-wrapper">
            <span class="factor-sign-minimal ${isIncrease ? 'increases' : 'decreases'}" aria-hidden="true">
              ${isIncrease ? '+' : '−'}
            </span>
            <span class="factor-name">${escapeHtml(factor.feature)}</span>
            <span class="factor-impact-val">${factor.absImpact.toFixed(3)} impact</span>
          </div>
          <span class="factor-direction-badge ${isIncrease ? 'increases' : 'decreases'}">
            ${isIncrease ? '▲ Increases Risk' : '▼ Decreases Risk'}
          </span>
        </div>
        <div class="factor-bar-track">
          <div class="factor-bar-fill ${isIncrease ? 'increases' : 'decreases'}" style="width: 0%;"></div>
        </div>
      `;

      factorsList.appendChild(row);

      requestAnimationFrame(() => {
        const barFill = row.querySelector('.factor-bar-fill');
        if (barFill) {
          barFill.style.width = `${relativePercent}%`;
        }
      });
    });
  }

  function updateDisclaimer(isHighRisk) {
    disclaimerBox.className = 'disclaimer-box';
    if (isHighRisk) {
      disclaimerBox.classList.add('at-risk');
      disclaimerIcon.textContent = '⚠️';
      disclaimerText.textContent =
        'Elevated probability indicated across glycemic and metabolic indicators. Comprehensive laboratory correlation and clinical evaluation are recommended.';
    } else {
      disclaimerBox.classList.add('low-risk');
      disclaimerIcon.textContent = '✅';
      disclaimerText.textContent =
        'Biomarker indicators fall within normal baseline predictive thresholds. Continue routine health maintenance and periodic screening.';
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
