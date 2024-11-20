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
    YEAR = "year",
}

export type CardRow = {
    label: string;
    answers: string[];
    _type: ROWTYPE;
    _isCaseSensitive: boolean;
};

export type CardCategory = {
    _ID: string;
    _dependencies: string[];
    _isShuffled: boolean;
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
