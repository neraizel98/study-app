// 국어 어휘력 데이터 등록부.
// 레벨별 단원은 KoreanVocabLevel*.js 파일이 addUnits()로 채운다.
// 낱말 하나: { id, word, pos, origin, hanja?, meaning, synonyms[], antonyms[], example, passage: { title, lines[], source } }
//   - origin: '순우리말' | '한자어' | '고전 어휘' | '관용 표현' | '외래어' 등
//   - synonyms/antonyms: 표준적으로 마땅한 짝이 없으면 빈 배열(해당 퀴즈 유형에서 제외)
//   - example: 낱말이 그대로 들어간 한 문장
//   - passage.lines: 낱말이 실제로 쓰인 2~4문장. source는 '자작' 또는 저작권이 끝난 고전의 작품명
(function (root) {
    'use strict';
    const levels = {
        level1: { id: 'level1', title: '레벨 1', grade: '중1~3', description: '중학교 교과서와 문학 작품에서 자주 만나는 어휘', available: true, units: [] },
        level2: { id: 'level2', title: '레벨 2', grade: '고1~3', description: '고등학교 문학·비문학 지문을 읽는 데 필요한 어휘', available: true, units: [] },
        level3: { id: 'level3', title: '레벨 3', grade: '대학·일반', description: '준비 중입니다.', available: false, units: [] }
    };
    // 학습 계획·관리자 화면은 어휘 본문 없이 이 색인만으로 단원을 고른다. 본문 파일의 단원 id와 같아야 한다(테스트로 확인).
    const unitIndex = {
        level1: [
            { id: 'kv1-u1', title: '순우리말 Ⅰ · 자연과 때' }, { id: 'kv1-u2', title: '순우리말 Ⅱ · 마음과 행동' },
            { id: 'kv1-u3', title: '고전 어휘 · 옛이야기와 고전 소설' }, { id: 'kv1-u4', title: '교과 한자어 · 설명과 논증' },
            { id: 'kv1-u5', title: '소설·수필 어휘 · 감정과 묘사' }, { id: 'kv1-u6', title: '속담·관용 표현' }
        ],
        level2: [
            { id: 'kv2-u1', title: '고전 시가 어휘' }, { id: 'kv2-u2', title: '고전 소설 어휘' }, { id: 'kv2-u3', title: '순우리말 심화' },
            { id: 'kv2-u4', title: '문학 개념어' }, { id: 'kv2-u5', title: '비평·논설 어휘' }, { id: 'kv2-u6', title: '한자 성어' }
        ],
        level3: []
    };
    function addUnits(levelId, units) {
        const level = levels[levelId];
        if (!level) throw new Error(`알 수 없는 어휘 레벨: ${levelId}`);
        for (const unit of units) {
            if (level.units.some(existing => existing.id === unit.id)) continue;
            level.units.push(unit);
        }
        level.units.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    const allWords = () => Object.values(levels).flatMap(level => level.units.flatMap(unit => unit.words.map(word => ({ ...word, levelId: level.id, unitId: unit.id, unitTitle: unit.title }))));
    const findWord = id => allWords().find(word => word.id === id) || null;
    root.KoreanVocabData = { levels, unitIndex, addUnits, allWords, findWord };
})(window);
