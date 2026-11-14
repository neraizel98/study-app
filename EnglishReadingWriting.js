(function (root) {
    'use strict';

    // Each group contains an inference/connection, a form change, and a bounded text answer.
    // Evidence positions are zero-based and refer to the existing passage, never its translation.
    const bank = {
        'er1-p0': [
            ['How does Mina keep a record of what she sees?', ['the moon shapes', 'in her notebook', 'She draws'], [0, 3], 'She draws the moon shapes in her notebook.'],
            ['Change “Mina looks at the moon.” to the past tense.', ['Mina looked at the moon.', 'She looked at the moon.'], [0]],
            ['What gets wider after Monday? Answer with a short phrase or sentence.', ['The bright part', 'The bright part of the moon', 'The bright part gets wider', 'The bright part of the moon gets wider', 'The bright part is wider'], ['The dark part', 'The dark part of the moon', 'The dark part gets wider'], [1, 2]]
        ],
        'er1-p1': [
            ['Why can we see the moon at night?', ['reaches our eyes', 'Because reflected sunlight', 'from the moon'], [1, 2], 'Because reflected sunlight from the moon reaches our eyes.'],
            ['Change “Sunlight reaches the moon.” to the past tense.', ['Sunlight reached the moon.', 'It reached the moon.'], [1]],
            ['Where does moonlight come from? Answer with a short phrase or sentence.', ['The sun', 'From the sun', 'It comes from the sun', 'Moonlight comes from the sun', 'Sunlight'], ['The moon', 'From the moon itself', 'It comes from the moon itself', 'The moon makes its own light'], [0, 4]]
        ],
        'er1-p2': [
            ['Why did people count cycles of moon shapes?', ['the passing months', 'to keep track of', 'They counted the cycles'], [1, 2], 'They counted the cycles to keep track of the passing months.'],
            ['Rewrite “People watched the moon.” in the present tense with “A person” as the subject.', ['A person watches the moon.'], [0]],
            ['What else did people watch when planning seasonal work?', ['Other signs in nature', 'Signs in nature', 'They watched other signs in nature', 'They also watched other signs in nature', 'People watched other signs in nature'], ['Only the moon', 'They watched only the moon', 'Printed calendars'], [3, 4]]
        ],
        'er3-p0': [
            ['How do Yuna’s tomatoes end up in a meal?', ['to make soup', 'for her family', 'Yuna uses the tomatoes'], [3, 4], 'Yuna uses the tomatoes to make soup for her family.'],
            ['Change “Yuna gives the seeds water.” to the past tense.', ['Yuna gave the seeds water.', 'She gave the seeds water.', 'Yuna gave water to the seeds.', 'She gave water to the seeds.'], [1]],
            ['How many seeds does Yuna plant?', ['Three', '3', 'Three seeds', 'Three tomato seeds', 'She plants three seeds', 'Yuna plants three tomato seeds'], ['Two', '2', 'Four', '4', 'Four seeds'], [0]]
        ],
        'er3-p1': [
            ['Why does the class decide to eat a variety of foods?', ['everything a child needs', 'provide', 'Because no single color can'], [1, 2, 3, 4], 'Because no single color can provide everything a child needs.'],
            ['Rewrite “Brown rice gives energy.” with “Beans” as the subject. Keep the present tense.', ['Beans give energy.'], [2]],
            ['Which two foods are said to help build the body?', ['Beans and eggs', 'Eggs and beans', 'Beans and eggs help build the body', 'Eggs and beans help build the body'], ['Rice and carrots', 'Spinach and rice', 'Carrots and eggs'], [2]]
        ],
        'er3-p2': [
            ['How do workers help prevent damage on the trip?', ['between the strawberries', 'They put', 'soft paper'], [1, 2], 'They put soft paper between the strawberries.'],
            ['Rewrite “A truck carries the boxes.” with “Two trucks” as the subject. Keep the present tense.', ['Two trucks carry the boxes.', '2 trucks carry the boxes.'], [3]],
            ['Where are the berries placed inside the store?', ['On a cool shelf', 'A cool shelf', 'They are placed on a cool shelf', 'The berries are placed on a cool shelf', 'Workers put them on a cool shelf'], ['On a warm shelf', 'On the floor', 'They are placed on a warm shelf'], [4]]
        ],
        'mr1-unit1-p1': [
            ['Why did the council photograph the objects one by one?', ['each object more easily', 'So that owners', 'could recognize'], [1, 3, 5], 'So that owners could recognize each object more easily.'],
            ['Change “The members sorted the objects by type.” to the present tense with “One member” as the subject.', ['One member sorts the objects by type.', '1 member sorts the objects by type.'], [2]],
            ['Besides the number, what could an owner tell the office worker?', ['A detail not visible in the picture', 'A detail that was not visible in the picture', 'A detail that was not shown in the photo', 'A detail not shown in the photo', 'They could describe a detail that was not visible in the picture'], ['A detail visible in the picture', 'A detail that was visible in the picture', 'A name shown in the photo'], [3, 4]]
        ],
        'mr1-unit1-p2': [
            ['How can returning seeds help the next visitor?', ['start a garden', 'a family', 'The returned seeds can help'], [2, 3], 'The returned seeds can help a family start a garden.'],
            ['Change “One volunteer kept a notebook.” to the present tense with “Two volunteers” as the subject.', ['Two volunteers keep a notebook.', '2 volunteers keep a notebook.'], [4]],
            ['What was the rule about bringing seeds back? Answer with a short phrase or sentence.', ['They did not have to return seeds', 'They didn’t have to return seeds', 'Returning seeds was optional', 'Returning seeds was not required'], ['Visitors had to return seeds', 'Returning seeds was required'], [2]]
        ],
        'mr1-unit1-p3': [
            ['Why did the school try moving the water station?', ['there', 'the line often stopped', 'Because'], [1, 2, 3], 'Because the line often stopped there.'],
            ['Rewrite “Dami watched the line.” in the present tense with “The students” as the subject.', ['The students watch the line.'], [1]],
            ['Where was the station moved for the trial?', ['Beside the dining-room exit', 'Beside the dining room exit', 'Next to the dining room exit', 'To a wide space beside the dining-room exit', 'A wide space beside the dining-room exit', 'It was moved beside the dining-room exit'], ['To the stairs', 'Beside the stairs', 'Inside the kitchen', 'It stayed in the same place'], [3]]
        ],
        'mr1-unit2-p1': [
            ['Why did Inho choose a covered seat the next day?', ['while he read', 'give him shade', 'A roof would'], [1, 5], 'A roof would give him shade while he read.'],
            ['Rewrite “Inho chose a bench.” in the present tense with “The boys” as the subject.', ['The boys choose a bench.'], [0]],
            ['What did Inho use to mark the edge of the shadow?', ['Fallen leaves', 'Leaves', 'He used fallen leaves', 'Inho used fallen leaves', 'He marked it with fallen leaves', 'With fallen leaves'], ['Chalk', 'Stones', 'He used chalk'], [2]]
        ],
        'mr1-unit2-p2': [
            ['Why did Leo watch his uncle’s hands closely?', ['the dough needed', 'To see when', 'more kneading'], [2, 3], 'To see when the dough needed more kneading.'],
            ['Change “Leo measured the ingredients.” to the present tense.', ['Leo measures the ingredients.', 'He measures the ingredients.'], [2]],
            ['How should the dough feel according to Leo’s uncle?', ['Soft but not sticky', 'Soft and not sticky', 'It should feel soft but not sticky', 'The dough should feel soft but not sticky', 'Soft without sticking to his fingers', 'It should feel soft and not stick to his fingers'], ['Hard and sticky', 'Soft and sticky', 'It should feel soft and sticky'], [1]]
        ],
        'mr1-unit2-p3': [
            ['Why did Sumi replace color clues?', ['would not help', 'Because colors', 'listeners who could not see them'], [1, 2, 3], 'Because colors would not help listeners who could not see them.'],
            ['Change “A volunteer pointed out a problem.” to the present tense with “The volunteers” as the subject.', ['The volunteers point out a problem.'], [2]],
            ['What hazard did Sumi add a warning about?', ['A driveway', 'The driveway', 'She warned about a driveway', 'She added a warning about a driveway', 'A warning about a driveway'], ['A red sign', 'A blue building', 'She warned about a red sign'], [4]]
        ]
    };

    const labels = { 'phrase-arrange': '내용 이해 · 구절 조합', rewrite: '문법 · 형태 바꾸기', 'reading-short': '내용 이해 · 영어 단답' };
    const normalize = value => String(value ?? '').normalize('NFKC').trim().toLowerCase()
        .replace(/[’‘]/g, "'").replace(/\s+/g, ' ').replace(/\s+([,.;!?])/g, '$1').replace(/[.!?]+$/, '');

    function questions(passageId) {
        const pack = bank[passageId];
        if (!pack) return [];
        const [[arrangePrompt, tokens, arrangeEvidence, arranged], [rewritePrompt, rewrites, rewriteEvidence], [shortPrompt, answers, conflicts, shortEvidence]] = pack;
        return [
            { type: 'phrase-arrange', prompt: arrangePrompt, tokens: [...tokens], acceptedAnswers: [arranged], evidence: [...arrangeEvidence], explanation: '본문 단서를 연결해 질문에 맞는 답을 만들어요.' },
            { type: 'rewrite', prompt: rewritePrompt, acceptedAnswers: [...rewrites], evidence: [...rewriteEvidence], explanation: '문제에서 정한 주어와 시제에 맞게 동사를 바꿔요.' },
            { type: 'reading-short', prompt: shortPrompt, acceptedAnswers: [...answers], rejectedAnswers: [...conflicts], evidence: [...shortEvidence], explanation: '질문에 해당하는 본문 내용을 짧게 답해요.' }
        ].map(q => ({ ...q, id: `${passageId}-write-v1-${q.type}`, answer: q.acceptedAnswers[0], skill: q.type === 'rewrite' ? 'sentence-form' : 'written-comprehension' }));
    }

    function grade(question, value) {
        const answer = normalize(value);
        if (question.acceptedAnswers.some(accepted => normalize(accepted) === answer)) return true;
        if (question.type !== 'reading-short' || question.rejectedAnswers.some(rejected => normalize(rejected) === answer)) return false;
        return null;
    }

    const api = { questions, grade, labels, passageIds: Object.keys(bank) };
    root.EnglishReadingWriting = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
