(function (root) {
    'use strict';
    // These form changes belong to previously unseen exam passages.
    // Each row gives a sentence, an explicit change, and verified equivalent answers.
    const forms = {
        'mock-en-grade6-a': [
            ['Mina puts a box beside the door.', 'Use the past tense.', ['Mina put a box beside the door.', 'She put a box beside the door.']],
            ['Mina plays outside.', 'Use “The children” as the subject. Keep the present tense.', ['The children play outside.']]
        ],
        'mock-en-grade6-b': [
            ['Jun wants to grow a bean plant.', 'Use “The students” as the subject. Keep the present tense.', ['The students want to grow a bean plant.']],
            ['Jun puts two cups by the window.', 'Use the past tense.', ['Jun put two cups by the window.', 'He put two cups by the window.']]
        ],
        'mock-retake-en-grade6-a': [
            ['Leo finds a red scarf.', 'Use the past tense.', ['Leo found a red scarf.', 'He found a red scarf.']],
            ['Leo wants to find the owner.', 'Use “Leo and Nari” as the subject. Keep the present tense.', ['Leo and Nari want to find the owner.']]
        ],
        'mock-retake-en-grade6-b': [
            ['Ella reads a story every evening.', 'Use “Ella and Tom” as the subject. Keep the present tense.', ['Ella and Tom read a story every evening.']],
            ['Tom asks her to go back.', 'Use the past tense.', ['Tom asked her to go back.', 'He asked her to go back.']]
        ],
        'mock-en-middle1-a': [
            ['A club member puts the items on a table.', 'Use “Two club members” as the subject. Keep the present tense.', ['Two club members put the items on a table.']],
            ['Students write their names before lunch.', 'Use the past tense.', ['Students wrote their names before lunch.', 'They wrote their names before lunch.']]
        ],
        'mock-en-middle1-b': [
            ['The garden opens on Saturdays.', 'Use the past tense.', ['The garden opened on Saturdays.', 'It opened on Saturdays.']],
            ['Each family takes one small bag.', 'Use “The families” as the subject. Keep the present tense.', ['The families take one small bag.']]
        ],
        'mock-retake-en-middle1-a': [
            ['Ben plays music during practice.', 'Use “The boys” as the subject. Keep the present tense.', ['The boys play music during practice.']],
            ['The director asks him to leave a pause silent.', 'Use the past tense.', ['The director asked him to leave a pause silent.']]
        ],
        'mock-retake-en-middle1-b': [
            ['Each student brings one drawing.', 'Use “The students” as the subject. Keep the present tense.', ['The students bring one drawing.']],
            ['Ms. Park asks students to write their names.', 'Use the past tense.', ['Ms. Park asked students to write their names.', 'She asked students to write their names.']]
        ]
    };
    function create(passage) {
        return (forms[passage.id] || []).map(([sentence, instruction, acceptedAnswers], index) => ({
            id: passage.id + '-written-form-' + index,
            kind: 'written', answerFormat: 'english-form', question: instruction + '\n' + sentence,
            answer: acceptedAnswers[0], acceptedAnswers: [...acceptedAnswers], inputHint: 'Write the complete sentence.',
            explanation: instruction + ' ' + acceptedAnswers[0], skill: 'sentence-form',
            difficulty: 'standard', cognitiveDemand: 'application', noveltyKind: 'new-context-application'
        }));
    }
    root.MockEnglishWriting = { create };
})(typeof window !== 'undefined' ? window : globalThis);
