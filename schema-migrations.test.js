const assert = require('node:assert/strict');
const { migrate, migrateUserData, CURRENT } = require('./schema-migrations.js');

const legacy = {
    id: 'fixture-user',
    totalStudyTime: 120,
    dailyStats: { date: '2026-07-30', studyTime: {} }
};
const once = migrateUserData(legacy);
const twice = migrateUserData(once);
assert.equal(once.schemaVersion, CURRENT.user);
assert.deepEqual(twice, once, 'Migration must be idempotent');
assert.equal(legacy.schemaVersion, undefined, 'Migration must not mutate input');
assert.ok(once.monthlyStats);
assert.ok(once.formulaStudyTime);

const reports = migrate('reports', [{ sessionId: 's1', date: 1 }]);
assert.equal(reports.schemaVersion, CURRENT.reports);
assert.equal(reports.items[0].updatedAt, 1);
assert.deepEqual(migrate('reports', reports), reports);

const wrong = migrate('wrongAnswers', { grammar: [{ type: 'q1' }] });
assert.equal(wrong.schemaVersion, CURRENT.wrongAnswers);
assert.equal(wrong.subjects.grammar.length, 1);

const config = migrate('timerConfig', { english: 5 });
assert.equal(config.schemaVersion, CURRENT.timerConfig);
assert.deepEqual(config.levels, {});

assert.throws(() => migrateUserData({ schemaVersion: CURRENT.user + 1 }), /future/i);
assert.throws(() => migrate('unknown', {}), /Unknown schema/);
console.log('Schema migrations verified.');
