export enum STATE {
    ASK = "ask",
    SHOW = "show",
    HIDE = "hide",
    CORRECT = "correct",
    INCORRECT = "incorrect",
}

export enum ROWTYPE {
    STRING = "string",
    NUMBER = "number",
}

export type CardRow = {
    label: string;
    answer: string;
    _type: ROWTYPE;
    _isCaseSensitive: boolean;
};

export type CardCategory = {
    _dependencies: string[];
    _isOrdered: boolean;
    _isSequential: boolean;
    name: string;
    rows: CardRow[];
};

export type Card = {
    categories: CardCategory[];
};

export type Deck = {
    id: string;
    name: string;
    cards: Card[];
};


