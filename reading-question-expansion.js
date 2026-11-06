(function (root) {
    'use strict';
    const data = root.EnglishReadingData;
    if (!data) return;
    const hash = value => [...String(value)].reduce((sum, character) => sum + character.charCodeAt(0), 0);
    const rotate = (items, amount) => items.slice(amount).concat(items.slice(0, amount));
    const tokenize = sentence => String(sentence).trim().split(/\s+/).filter(Boolean);
    const choiceSet = (answer, distractors, seed) => {
        const base = [answer, ...distractors.filter(value => value !== answer)].filter((value, index, rows) => rows.indexOf(value) === index).slice(0, 4);
        const shift = seed % 4, choices = rotate(base, shift);
        return { choices, answerIndex: choices.indexOf(answer) };
    };

    for (const passage of data.units.flatMap(unit => unit.passages || [])) {
        if (!Array.isArray(passage.sentences) || passage.sentences.length < 5) continue;
        const ids = new Set((passage.questions || []).map(question => question.id));
        const seed = hash(passage.id);
        const lengths = passage.sentences.map((sentence, index) => ({ index, length: tokenize(sentence).length }));
        const arrangeTarget = (lengths.filter(item => item.length >= 5 && item.length <= 16).sort((a, b) => a.length - b.length)[seed % Math.max(1, lengths.filter(item => item.length >= 5 && item.length <= 16).length)]
            || lengths.sort((a, b) => a.length - b.length)[0]).index;
        const arrangeId = `${passage.id}-arrange`;
        if (!ids.has(arrangeId)) {
            const answer = passage.sentences[arrangeTarget];
            const tokens = tokenize(answer);
            const offset = 1 + seed % Math.max(1, tokens.length - 1);
            const shuffledTokens = rotate(tokens, offset);
            passage.questions.push({ id: arrangeId, type: 'arrange', skill: 'sentence-structure',
                prompt: `Arrange the words to rebuild sentence ${arrangeTarget + 1}.`, promptKo: `${arrangeTarget + 1}번 문장이 되도록 단어를 배열하세요.`,
                tokens: shuffledTokens, answer, explanation: `원문의 ${arrangeTarget + 1}번 문장은 “${answer}”입니다.`, evidence: [arrangeTarget], expansion: true });
            ids.add(arrangeId);
        }

        const locateTarget = (arrangeTarget + 2) % passage.sentences.length;
        const locateId = `${passage.id}-locate`;
        if (!ids.has(locateId)) {
            const indices = [locateTarget, ...passage.sentences.map((_, index) => index).filter(index => index !== locateTarget)].slice(0, 4);
            const answer = `Sentence ${locateTarget + 1}`;
            const set = choiceSet(answer, indices.filter(index => index !== locateTarget).map(index => `Sentence ${index + 1}`), seed + 1);
            passage.questions.push({ id: locateId, type: 'evidence', skill: 'evidence',
                prompt: `Which numbered sentence contains this exact statement? “${passage.sentences[locateTarget]}”`, promptKo: '제시된 문장이 있는 번호를 고르세요.',
                ...set, explanation: `제시문은 원문의 ${locateTarget + 1}번 문장과 정확히 같습니다.`, evidence: [locateTarget], expansion: true });
            ids.add(locateId);
        }

        const beforeIndex = (locateTarget + 1) % (passage.sentences.length - 1);
        const afterIndex = beforeIndex + 1;
        const sequenceId = `${passage.id}-sequence`;
        if (!ids.has(sequenceId)) {
            const answer = passage.sentences[afterIndex];
            const distractors = passage.sentences.filter((_, index) => index !== afterIndex && index !== beforeIndex).slice(0, 3);
            const set = choiceSet(answer, distractors, seed + 2);
            passage.questions.push({ id: sequenceId, type: 'sequence', skill: 'sequence',
                prompt: `Which sentence comes immediately after this sentence in the passage? “${passage.sentences[beforeIndex]}”`, promptKo: '본문에서 바로 다음에 이어지는 문장을 고르세요.',
                ...set, explanation: `${beforeIndex + 1}번 문장 바로 뒤에는 ${afterIndex + 1}번 문장이 이어집니다.`, evidence: [beforeIndex, afterIndex], expansion: true });
        }
    }
})(typeof window !== 'undefined' ? window : globalThis);
