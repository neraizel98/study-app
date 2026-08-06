const fs = require('fs');
const assert = require('assert');
const vm = require('vm');

const migrationsContext = { window: {}, globalThis: {}, console };
migrationsContext.window = migrationsContext;
migrationsContext.globalThis = migrationsContext;
vm.createContext(migrationsContext);
vm.runInContext(fs.readFileSync('schema-migrations.js', 'utf8'), migrationsContext);

const migrations = migrationsContext.SmartStudy.SchemaMigrations;
const reportEnvelope = migrations.migrate('reports', [{ sessionId: 's1', date: 100 }]);
assert.strictEqual(reportEnvelope.schemaVersion, 3);
assert.strictEqual(reportEnvelope.items[0].createdAt, 100);
assert.strictEqual(reportEnvelope.items[0].updatedAt, 100);
assert.strictEqual(reportEnvelope.items[0].deviceId, 'legacy');

const wrongEnvelope = migrations.migrate('wrongAnswers', {
    english: [{ wrongNoteId: 'word', date: 100, history: [{ sessionId: 's1', round: 1, status: 'wrong', date: 100 }] }]
});
assert.strictEqual(wrongEnvelope.schemaVersion, 3);
assert(wrongEnvelope.subjects.english[0].history[0].eventId);

const formulaTest = fs.readFileSync('math-formula.test.js', 'utf8');
assert(!formulaTest.includes("report.js?v=20260730-architecture'),"), 'Cache-busting versions must not be fixed test contracts');

const share = fs.readFileSync('kakao-share.js', 'utf8');
const reportPage = fs.readFileSync('report.html', 'utf8');
assert(share.includes('SHARE_TTL_MS: 7 * 24 * 60 * 60 * 1000'));
assert(share.includes("_encodeSharePayload('report-history'"));
assert(share.includes('_minimalReport(report)'));
assert(reportPage.includes("decodeSharedPayload(importData, 'single-report')"));
assert(reportPage.includes('Date.now() > parsed.expiresAt'));
assert(reportPage.includes('escapeHtml(item.display)'));

const firebaseClient = fs.readFileSync('firebase-client.js', 'utf8');
const firebaseSync = fs.readFileSync('firebase-sync.js', 'utf8');
const rules = fs.readFileSync('firestore.rules', 'utf8');
assert(firebaseClient.includes('firebase-auth-compat.js'));
assert(firebaseClient.includes('Auth.Persistence.LOCAL'));
assert(firebaseClient.includes('auth.setPersistence'));
assert(firebaseClient.includes("'auth/popup-blocked'"));
assert(firebaseClient.includes('signInWithRedirect(provider)'));
assert(firebaseSync.includes('FirebaseClient.getCurrentUser()'));
assert(rules.includes('allow read, write: if false'));
assert(rules.includes('learnerIds'));

const admin = fs.readFileSync('admin.html', 'utf8');
const stats = fs.readFileSync('stats.html', 'utf8');
assert(admin.includes('const SUBJECT_IDS = SUBJECTS.map'));
assert(admin.includes("error.code = 'auth/login-required'"));
assert(admin.includes('Google로 관리자 연결'));
assert(stats.includes('const SUBJECT_IDS = SUBJECTS.map'));
assert(stats.includes('datasets: SUBJECT_IDS.map'));

console.log('Security boundaries, expiring share payloads, versioned records, and registry-driven subjects verified.');
