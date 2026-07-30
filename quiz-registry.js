(function (root) {
    'use strict';
    const formulaGenerators = new Map();
    let formulaBase = null;
    const Registry = {
        setFormulaBase(api) {
            if (formulaBase) throw new Error('Formula base API is already registered');
            formulaBase = api;
        },
        registerFormulaGenerators(source, generators) {
            Object.entries(generators).forEach(([number, generator]) => {
                const key = Number(number);
                if (formulaGenerators.has(key)) throw new Error(`Duplicate formula quiz ${key} from ${source}`);
                formulaGenerators.set(key, generator);
            });
        },
        formulaFacade: {
            create(number) {
                const generator = formulaGenerators.get(Number(number));
                if (generator) return generator();
                if (!formulaBase) throw new Error('Formula base API is not registered');
                return formulaBase.create(number);
            },
            isCorrect(question, response) {
                if (!formulaBase) throw new Error('Formula base API is not registered');
                return formulaBase.isCorrect(question, response);
            }
        },
        formulaNumbers: () => [...formulaGenerators.keys()].sort((a, b) => a - b)
    };
    root.SmartStudy = root.SmartStudy || {};
    root.SmartStudy.QuizRegistry = Registry;
})(window);
