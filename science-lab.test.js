const { test } = require('node:test');
const assert = require('node:assert/strict');
const { heatWater, SPECIFIC_HEAT } = require('./science_lab');
test('equal energy gives an inverse mass temperature rise below boiling', () => {
    const small = heatWater({ massKg: 1 });
    const large = heatWater({ massKg: 2 });
    assert.equal(SPECIFIC_HEAT, 4200);
    assert.equal(small.joules, 60000);
    assert.equal(large.joules, small.joules);
    assert(Math.abs(small.temperatureC - 34.2857142857) < 1e-9);
    assert(Math.abs(large.temperatureC - 27.1428571429) < 1e-9);
    assert.equal(small.riseC, large.riseC * 2);
    assert.equal(heatWater({ massKg: 1, seconds: 0 }).temperatureC, 20);
    for (const massKg of [.5, 1, 2]) {
        assert(heatWater({ massKg }).temperatureC < 100);
        const half = heatWater({ massKg, seconds: 30 });
        assert.equal(heatWater({ massKg }).riseC, half.riseC * 2);
    }
});
test('unsupported states cannot produce misleading quantitative output', () => {
    for (const massKg of [0, -1, NaN, Infinity]) assert.throws(() => heatWater({ massKg }), RangeError);
    assert.throws(() => heatWater({ massKg: 1, seconds: -1 }), RangeError);
    assert.throws(() => heatWater({ massKg: .01 }), RangeError);
    assert.throws(() => heatWater({ massKg: 1, initialC: 100 }), RangeError);
});
