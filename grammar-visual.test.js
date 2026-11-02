const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const sandbox = { window: {} };
vm.createContext(sandbox);
for (const file of ['EnglishGrammarData.js', 'EnglishGrammarExpanded.js', 'GrammarVisualLessons.js']) {
    vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
}
const visuals = sandbox.window.GrammarVisualLessons;
// Deliberately exclude arbitrary noun+'s: possession must not count as contraction.
const contraction = /\b(?:I['’](?:m|ve|ll|d)|(?:you|we|they)['’](?:re|ve|ll|d)|(?:he|she|it|there|who|where)['’](?:s|ll|d)|(?:is|are|was|were|do|does|did|has|have|had|could|should|would|must|need)n['’]t|can['’]t|won['’]t|room['’]s\s+been)\b/i;
const noEmoji = /\p{Extended_Pictographic}/u;
let count = 0;
for (const [stage, curriculum] of Object.entries(sandbox.window.EnglishGrammarData)) {
    for (const unit of curriculum.units) {
        unit.lessons.forEach((original, index) => {
            const key = `${stage}/${unit.id}/${index}`;
            const lesson = visuals.get(stage, unit.id, index);
            assert(lesson, `${key} ${original.title}: authored visual coverage`);
            assert(lesson.rule.length > 15 && lesson.rule.length < 130, `${key}: concise authored rule`);
            assert(!lesson.rule.includes('\n'), `${key}: one rule`);
            assert(lesson.flow.length >= 3 && lesson.flow.length <= 4, `${key}: complete diagram`);
            assert(lesson.flow.every(node => node.length === 2 && node.every(text => typeof text === 'string' && text.trim())), `${key}: labels and structural examples`);
            assert.equal(lesson.examples.length, 2, `${key}: exactly two register examples`);
            const [spoken, written] = lesson.examples;
            assert.equal(spoken.register, '구어체');
            assert.equal(written.register, '문어체');
            assert(contraction.test(spoken.en), `${key}: actual English contraction: ${spoken.en}`);
            assert(!contraction.test(written.en), `${key}: uncontracted formal sentence`);
            assert.match(spoken.ko, /어\.$/, `${key}: authored colloquial ending`);
            assert.match(written.ko, /다\.$/, `${key}: authored written ending`);
            assert(!noEmoji.test(JSON.stringify(lesson)), `${key}: no decorative emoji`);
            const diagram = visuals.diagramHTML(lesson);
            assert.equal((diagram.match(/grammar-flow-node/g) || []).length, lesson.flow.length);
            assert.equal((diagram.match(/grammar-flow-arrow/g) || []).length, lesson.flow.length - 1);
            assert(diagram.includes('aria-label="문법 구조 흐름"'));
            const examples = visuals.examplesHTML(lesson);
            assert.equal((examples.match(/<article /g) || []).length, 2);
            assert.equal((examples.match(/data-accent="us"/g) || []).length, 2);
            assert.equal((examples.match(/<svg /g) || []).length, 2);
            assert.equal((examples.match(/data-speak=/g) || []).length, 2);
            count++;
        });
    }
}
assert.equal(count, 92);
assert.equal(visuals.get('missing', 'e1', 0), null);
assert.equal(visuals.get('elementary', 'e1', 100), null);

// Every lesson's examples must contain its actual grammatical construction.
// These are semantic anchors for authored content, not an English grammar parser.
const anchors = {
    elementary: {
        e1: [/\bread(?:ing|s) a book/, /\bThey are/i],
        e2: [/\bWe're at home/, /\bIs she at home/],
        e3: [/\bShe knows/, /\bDoes he like/],
        e4: [/\bvisited Busan yesterday/, /\bgoing to visit/],
        e5: [/\bDon't touch/, /\bmust wear/],
        e6: [/\bquietly/, /\bbecause/]
    },
    middle: {
        m1: [/\bseems happy/, /\bgave me a book.*made me happy/],
        m2: [/\bwere studying/, /\bwent there yesterday.*I'll go/],
        m3: [/\bshouldn't/, /\bHow beautiful/],
        m4: [/\bsomething to eat/, /\benjoying reading/],
        m5: [/\bmany books or much time/, /\balways writes carefully/],
        m6: [/\bas tall as.*the tallest/, /\bat seven on Monday because/],
        m7: [/\bWho lives here/, /\bdon't have a pen, do you/],
        m8: [/\bThere are three/, /\bIt is five kilometers/],
        m9: [/\bI've lost/, /\bfor three years/],
        m10: [/\bwas built/, /\bwho helped you/]
    },
    middle2: {
        n2u1: [/\bhas lived here for ten years/, /\byesterday.*has visited.*so far/],
        n2u2: [/\bwas cleaned.*will be cleaned/, /\bwas given to Mina/],
        n2u3: [/\bhow to use/, /\bremember locking.*remembered to lock/],
        n2u4: [/\bexcited.*exciting/, /\bwanted him to leave.*kept the door open/],
        n2u5: [/\bteacher you called/, /\bwhose bike/],
        n2u6: [/\bwhether she'll come if it rains/, /\bwhere she lives/]
    },
    middle3: {
        n3u1: [/\bhad finished.*before he arrived/, /\bearth moves/],
        n3u2: [/\bIf I were you.*would ask/, /\bwish I had studied/],
        n3u3: [/\btown where/, /\bwhoever.*which surprised/],
        n3u4: [/\bSeeing me, she waved/, /\bHaving finished.*Written in simple English/],
        n3u5: [/\bNever have I seen/, /\bneither can Mina/],
        n3u6: [/\basked me why I couldn't/, /\btold me not to open/]
    },
    high1: {
        h1u1: [/\bbox of books isn't/, /\bseems calm.*keeps the children quiet/],
        h1u2: [/\blived here since 2020/, /\bhad left.*couldn't catch/],
        h1u3: [/\bdon't have to/, /\bhasn't been finished/],
        h1u4: [/\bhard for me to understand/, /\blooking forward to meeting/],
        h1u5: [/\bbored.*boring/, /\btown where.*house which/],
        h1u6: [/\bif she will come.*until she arrives/, /\bas many books as/]
    },
    high2: {
        h2u1: [/\bwill have finished/, /\bcan't have forgotten/],
        h2u2: [/\bIf she had studied.*would have passed/, /\bIf I'd taken.*would be living.*now/],
        h2u3: [/\bhaving finished.*to have left.*being kept/, /\bwas made to wait.*was seen to leave/],
        h2u4: [/\bHaving read.*Surrounded by trees/, /\bweather being fine.*with the birds singing/],
        h2u5: [/\bwhat you mean.*news that she won.*news that we heard/, /\bwhoever asked, which/],
        h2u6: [/\bOnly then did I understand/, /\bnot only reads.*but also writes/]
    },
    high3: {
        h3u1: [/\breport that you sent isn't/, /\bwoman standing.*book written.*explains/],
        h3u2: [/\bHad I taken.*Without your help/, /\bmust have worked.*had to finish/],
        h3u3: [/\bnews that we heard.*news that she had won/, /\btwo of whom.*three of which/],
        h3u4: [/\bdon't.*always agree.*Not all.*none of them/is, /\bmuch more time.*larger than that of/],
        h3u5: [/\bIt's Mina that I called.*It is clear that/, /\bso is Mina.*neither did Mina/],
        h3u6: [/\bsurprised.*surprising.*report written/, /\bwhere she lives.*if she comes.*whether she will join/]
    }
};
let anchored = 0;
for (const [stage, units] of Object.entries(anchors)) {
    for (const [unit, patterns] of Object.entries(units)) {
        patterns.forEach((pattern, index) => {
            assert.match(visuals.get(stage, unit, index).examples.map(example => example.en).join(' '), pattern, `${stage}/${unit}/${index}: lesson-specific construction`);
            anchored++;
        });
    }
}
assert.equal(anchored, 92);

const hostile = { flow: [['<script>', '"&\'']], examples: [{ register: '구어체', en: '\" onmouseover=\"bad <script>&', ko: '<img>' }] };
assert(!visuals.diagramHTML(hostile).includes('<script>'));
assert(!visuals.examplesHTML(hostile).includes('<script>'));
assert(visuals.examplesHTML(hostile).includes('&quot; onmouseover=&quot;bad &lt;script&gt;&amp;'));

const html = fs.readFileSync('english_grammar.html', 'utf8');
const app = fs.readFileSync('EnglishGrammarApp.js', 'utf8');
const css = fs.readFileSync('grammar-visual.css', 'utf8');
assert(html.indexOf('GrammarVisualLessons.js?') < html.indexOf('EnglishGrammarApp.js?'));
assert(html.includes('id="grammarDiagram"'));
assert(html.includes('<details class="grammar-details">'));
for (const id of ['principleDetail', 'rules', 'commonError', 'lessonPractice', 'tip', 'prevLesson', 'nextLesson', 'startQuiz']) {
    assert.equal((html.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1, `${id}: preserved DOM contract`);
}
assert(app.includes('GrammarVisualLessons?.get(stageId, unit().id, lessonIndex)'));
assert(app.includes("closest('[data-speak]')"));
assert(css.includes('flex-wrap:wrap'));
assert(css.includes('transform:rotate(90deg)'));
assert(css.includes('grid-template-columns:minmax(0,1fr)'));
console.log(`Grammar visual lessons verified: ${count} lessons, ${count * 2} authored register examples, 92 construction anchors, diagrams, speech and escaping.`);

assert.match(visuals.get('high3','h3u5',0).rule,/It is\/was/);
assert.match(visuals.get('high2','h2u3',1).rule,/맡기거나.*겪는/);
assert.match(visuals.get('high3','h3u2',1).rule,/후회·비판 문맥/);
