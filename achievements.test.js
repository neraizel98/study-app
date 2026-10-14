const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const keyOf = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const StudyPeriods = {
    daily: (d = new Date()) => keyOf(d),
    weekly: (d = new Date()) => { const m = new Date(d.getFullYear(), d.getMonth(), d.getDate()); m.setDate(m.getDate() - ((m.getDay() + 6) % 7)); return keyOf(m); }
};
const daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return keyOf(d); };

function load(evidence) {
    const context = { window: {}, StudyPeriods };
    context.window.MissionManager = { evidence: () => evidence };
    vm.createContext(context);
    vm.runInContext(fs.readFileSync('achievements.js', 'utf8'), context);
    return context.window.Achievements;
}

// No submissions: nothing earned, no streak, empty stamps.
{
    const s = load([]).summary({ level: 1 });
    assert.strictEqual(s.current, 0);
    assert.strictEqual(s.longest, 0);
    assert.strictEqual(s.week.length, 7);
    assert(s.week.every(d => !d.stamped));
    assert(s.badges.every(b => !b.earned), 'No badge without evidence');
}

// Streak continues through yesterday even before today's quiz; longest run is kept.
{
    const ev = [1, 2, 3].map(n => ({ date: daysAgo(n), subject: 'reading' }))
        .concat([10, 11, 12, 13, 14, 15, 16, 17].map(n => ({ date: daysAgo(n), subject: 'math' })));
    const s = load(ev).summary({ level: 1 });
    assert.strictEqual(s.current, 3, 'Current streak counts back from yesterday');
    assert.strictEqual(s.longest, 8, 'Longest run is found anywhere in history');
    assert(s.badges.find(b => b.id === 'streak_7').earned);
    assert(!s.badges.find(b => b.id === 'streak_30').earned);
}

// Several quizzes on one day are one stamp; today's stamp is marked; level badge uses the user level.
{
    const today = daysAgo(0);
    const ev = ['reading', 'english', 'grammar', 'english_reading', 'math', 'math_formula', 'hanja'].map(subject => ({ date: today, subject }));
    const s = load(ev).summary({ level: 5 });
    assert.strictEqual(s.week.filter(d => d.stamped).length, 1);
    assert(s.week.find(d => d.isToday).stamped);
    assert.strictEqual(s.current, 1);
    assert(s.badges.find(b => b.id === 'explorer').earned, 'All seven areas earn the explorer badge');
    assert(s.badges.find(b => b.id === 'level_5').earned);
    assert(!s.badges.find(b => b.id === 'quiz_10').earned);
}

console.log('Achievements verified: streaks, weekly stamps and derived badges.');
