// 국어 어휘력 퀴즈 출제. 화면과 분리된 순수 함수라 테스트에서 그대로 쓴다.
// 유형: 뜻 고르기, 지문 속 문맥 의미, 빈칸 채우기, 유의어, 반의어.
(function (root) {
    'use strict';
    const TYPES = ['meaning', 'context', 'blank', 'synonym', 'antonym'];
    const LABELS = { meaning: '뜻', context: '문맥 의미', blank: '빈칸', synonym: '유의어', antonym: '반의어' };

    function shuffle(values, random) {
        const copy = [...values];
        for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
        return copy;
    }
    // Words that share a meaning or list each other as synonyms would make a second correct option.
    function related(a, b) {
        return a.id === b.id || a.word === b.word || a.meaning === b.meaning
            || (a.synonyms || []).includes(b.word) || (b.synonyms || []).includes(a.word);
    }
    function available(word) {
        return TYPES.filter(type => type !== 'synonym' && type !== 'antonym'
            || (type === 'synonym' ? word.synonyms : word.antonyms)?.length > 0);
    }
    const PHRASES = ['관용구', '속담'];
    // Groups are tried in order (closest first); each group is shuffled on its own.
    function pickFrom(groups, count, key, exclude, random) {
        const seen = new Set(exclude), picked = [];
        for (const candidate of groups.flatMap(group => shuffle(group, random))) {
            const value = key(candidate);
            if (!value || seen.has(value)) continue;
            seen.add(value); picked.push(value);
            if (picked.length === count) break;
        }
        return picked;
    }
    // ‘시나브로’와 / ‘성찰’과: 마지막 글자의 받침으로 고른다.
    function withParticle(text) {
        const last = String(text).trim().slice(-1), code = last.charCodeAt(0) - 0xAC00;
        return code >= 0 && code < 11172 && code % 28 !== 0 ? '과' : '와';
    }
    function blankLine(text, usage) {
        return String(text).split(usage).join('(          )');
    }

    // One question for `word` of `type`; `pool` is every word of the level (distractor source).
    function question(word, type, pool, random = Math.random) {
        const others = pool.filter(other => !related(other, word));
        // Options of the same kind (part of speech; phrases with phrases) so form alone never gives the answer away.
        const phrase = item => PHRASES.includes(item.pos);
        const sameKind = others.filter(other => other.pos === word.pos);
        const similarKind = others.filter(other => phrase(other) === phrase(word));
        // A unit gathers near-synonyms (흐뭇하다·뿌듯하다, 해거름·땅거미), so single-word options come from other units.
        // Phrases (관용구·속담) live in one unit only, so they keep their own unit.
        const outside = list => phrase(word) ? list : list.filter(other => other.unitId !== word.unitId);
        const meanings = count => pickFrom([outside(others)], count, other => other.meaning, [word.meaning], random);
        const words = () => pickFrom([outside(sameKind), outside(similarKind)], 3, other => other.word, [word.word, ...(word.synonyms || []), ...(word.antonyms || [])], random);
        let prompt, answer, distractors, passage = null;
        if (type === 'meaning') {
            prompt = `‘${word.word}’의 뜻으로 알맞은 것은?`; answer = word.meaning; distractors = meanings(3);
        } else if (type === 'context') {
            const lines = word.passage?.lines || [];
            passage = { title: word.passage?.title || '', lines, source: word.passage?.source || '' };
            // usage may carry a particle or ending (산마루에, 애틋한); ask about the headword itself.
            prompt = `지문에 쓰인 ‘${word.word}’의 뜻으로 알맞은 것은?`; answer = word.meaning; distractors = meanings(3);
        } else if (type === 'blank') {
            // Options are dictionary forms; the sentence keeps the inflected form hidden.
            prompt = `빈칸에 들어갈 낱말을 기본형으로 고르면?\n${blankLine(word.example, word.usage)}`;
            answer = word.word;
            distractors = words();
        } else if (type === 'synonym' || type === 'antonym') {
            const list = type === 'synonym' ? word.synonyms : word.antonyms;
            answer = list[Math.floor(random() * list.length)];
            prompt = `‘${word.word}’${withParticle(word.word)} ${type === 'synonym' ? '뜻이 비슷한' : '뜻이 반대인'} 말은?`;
            // words() also excludes every listed synonym and antonym, so no option is a second correct answer.
            distractors = words();
        } else throw new Error(`알 수 없는 문제 유형: ${type}`);
        if (distractors.length < 3) return null;
        const choices = shuffle([answer, ...distractors], random);
        return {
            id: `${word.id}:${type}`, wordId: word.id, type, typeLabel: LABELS[type], word: word.word, question: prompt,
            passage, choices, answer, explanation: `${word.word}: ${word.meaning}${word.example ? ` 예) ${word.example}` : ''}`,
            levelId: word.levelId, unitId: word.unitId, unitTitle: word.unitTitle
        };
    }

    // Build a quiz from `words` (the unit) using `pool` (the level). `priority` word ids come first (due wrong notes).
    function build({ words, pool, count = 10, priority = [], random = Math.random }) {
        const ordered = [...shuffle(words.filter(word => priority.includes(word.id)), random), ...shuffle(words.filter(word => !priority.includes(word.id)), random)];
        const items = [], used = new Map();
        for (const word of ordered) {
            if (items.length >= count) break;
            // Spread question types: prefer the type used least so far that this word supports.
            const types = shuffle(available(word), random).sort((a, b) => (used.get(a) || 0) - (used.get(b) || 0));
            for (const type of types) {
                const item = question(word, type, pool, random);
                if (item) { items.push(item); used.set(type, (used.get(type) || 0) + 1); break; }
            }
        }
        return shuffle(items, random);
    }

    root.KoreanVocabQuiz = { build, question, related, available, TYPES, LABELS };
})(window);
