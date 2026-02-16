import test from 'node:test';
import assert from 'node:assert/strict';
import { generateTips, projectSellValue, scoreStock } from '../src/analysis.js';
import { LOCAL_PRICE_SERIES } from '../src/localPrices.js';

test('projectSellValue grows with time for positive return', () => {
  const three = projectSellValue(500, 0.12, 3);
  const twelve = projectSellValue(500, 0.12, 12);
  assert.ok(twelve > three);
  assert.ok(three > 500);
});

test('scoreStock returns diagnostics and annual return bounds', () => {
  const stock = {
    code: 'BHP',
    company: 'BHP Group',
    sector: 'Materials',
    newsSentiment: 0.2,
    blogSentiment: 0.2,
    reportSignal: 0.6,
  };
  const scored = scoreStock(stock, LOCAL_PRICE_SERIES.BHP);
  assert.ok(scored);
  assert.ok(scored.annualReturn >= 0.02 && scored.annualReturn <= 0.35);
  assert.equal(typeof scored.diagnostics.r3m, 'number');
});

test('generateTips returns three stocks, growth %, and excludes restricted sectors', async () => {
  const tips = await generateTips();
  assert.equal(tips.length, 3);
  for (const tip of tips) {
    assert.notEqual(tip.sector, 'Airlines');
    assert.notEqual(tip.sector, 'Hospitality');
    assert.notEqual(tip.sector, 'Fast Food');
    assert.equal(tip.projections.length, 4);
    assert.equal(typeof tip.last3mGrowthPct, 'number');
    for (const projection of tip.projections) {
      assert.equal(typeof projection.growthPct, 'number');
      assert.ok(projection.projectedSellValue > 0);
    }
  }
});

test('generateTips can avoid previous picks when excludeCodes are provided', async () => {
  const first = await generateTips();
  const excluded = first.map((tip) => tip.code);

  const second = await generateTips({ excludeCodes: excluded });
  assert.equal(second.length, 3);

  for (const tip of second) {
    assert.ok(!excluded.includes(tip.code));
  }
});
