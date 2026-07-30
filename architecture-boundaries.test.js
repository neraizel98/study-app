const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const files = fs.readdirSync(root).filter(name => /\.(js|html)$/.test(name) && !name.endsWith('.test.js'));
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const locations = pattern => files.flatMap(file => read(file).split(/\r?\n/).flatMap((line, index) => {
    pattern.lastIndex = 0;
    return pattern.test(line) ? [`${file}:${index + 1}`] : [];
}));

const directStorage = files.filter(file =>
    /localStorage\.(getItem|setItem|removeItem|clear)/.test(read(file)) && file !== 'local-repository.js'
);
assert.deepEqual(directStorage, [], `Direct localStorage access: ${directStorage}`);

const patches = files.filter(file => file !== 'report.js').flatMap(file =>
    read(file).split(/\r?\n/).flatMap((line, index) =>
        /(?:UserSession\.saveUserData|WrongNote\.(?:save|remove)|window\.saveQuizResult)\s*=/.test(line)
            ? [`${file}:${index + 1}`] : []
    )
);
assert.deepEqual(patches, [], `Runtime persistence patch: ${patches}`);

const firestoreOutsideRepository = files.filter(file =>
    /\.(collection|doc)\(/.test(read(file)) && file !== 'firestore-repository.js'
);
assert.deepEqual(firestoreOutsideRepository, [], `Direct Firestore access: ${firestoreOutsideRepository}`);

assert.equal(locations(/Kakao\.Share\.sendDefault\(/).length, 1, 'Kakao SDK must have one call point');
assert.equal(locations(/firebase-app-compat\.js/).length, 1, 'Firebase app SDK URL must be centralized');
assert.equal(locations(/firebase-firestore-compat\.js/).length, 1, 'Firestore SDK URL must be centralized');
assert.equal(locations(/window\.MathFormulaQuiz\s*=/).length, 1, 'Formula facade must be assigned once');

for (const file of files.filter(name => name.endsWith('.html'))) {
    const scripts = [...read(file).matchAll(/<script[^>]+src=["']([^"']+)["']/g)]
        .map(match => match[1].replace(/[?#].*$/, ''));
    const duplicates = [...new Set(scripts.filter((src, index) => scripts.indexOf(src) !== index))];
    assert.deepEqual(duplicates, [], `${file}: duplicate script refs`);
}

const worker = read('service-worker.js');
const assetsBlock = worker.match(/const STATIC_ASSETS\s*=\s*\[([\s\S]*?)\];/)?.[1] || '';
const localAssets = [...assetsBlock.matchAll(/['"]\.\/([^'"]+)['"]/g)].map(match => match[1]).filter(Boolean);
const missing = localAssets.filter(asset => !fs.existsSync(path.join(root, asset)));
assert.deepEqual(missing, [], `Missing service worker assets: ${missing}`);

console.log('Architecture boundaries verified.');
