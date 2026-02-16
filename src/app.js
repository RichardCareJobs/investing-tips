import { generateTips } from "./analysis.js";

const generateBtn = document.querySelector("#generateBtn");
const status = document.querySelector("#status");
const results = document.querySelector("#results");
const resultsBody = document.querySelector("#resultsBody");
let previousCodes = [];

function formatDollars(value) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value) {
  return `${(value * 100).toFixed(2)}%`;
}

function renderRows(tips) {
  resultsBody.innerHTML = "";

  tips.forEach((tip) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${tip.code}</td>
      <td>${tip.company}</td>
      <td>${formatDollars(tip.currentPrice)}</td>
      <td>${formatPercent(tip.last3mGrowthPct)}</td>
      <td>${tip.rationale.join("<br>")}</td>
      <td>${formatDollars(tip.projections[0].projectedSellValue)}</td>
      <td>${formatPercent(tip.projections[0].growthPct)}</td>
      <td>${formatDollars(tip.projections[1].projectedSellValue)}</td>
      <td>${formatPercent(tip.projections[1].growthPct)}</td>
      <td>${formatDollars(tip.projections[2].projectedSellValue)}</td>
      <td>${formatPercent(tip.projections[2].growthPct)}</td>
      <td>${formatDollars(tip.projections[3].projectedSellValue)}</td>
      <td>${formatPercent(tip.projections[3].growthPct)}</td>
    `;

    resultsBody.appendChild(row);
  });
}

generateBtn.addEventListener("click", async () => {
  generateBtn.disabled = true;
  status.textContent = "Analysing ASX market data, public sentiment and report-style signals...";

  try {
    const tips = await generateTips({ excludeCodes: previousCodes });
    previousCodes = tips.map((tip) => tip.code);

    renderRows(tips);
    results.classList.remove("hidden");
    status.textContent = `Done. Generated ${tips.length} strong-buy projection ideas.`;
  } catch (error) {
    status.textContent = `Analysis failed: ${error.message}.`;
  } finally {
    generateBtn.disabled = false;
  }
});
