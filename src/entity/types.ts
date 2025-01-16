export enum STATE {
    ASK = "ask",
    SHOW = "show",
    HIDE = "hide",
    CORRECT = "correct",
    INCORRECT = "incorrect",
    DISABLE = "disable",
}

export type RowType = "text" | "name" | "number";

export type CardRow = {
    label: string;
    answers: string[];
    _type: RowType;
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
    template: Card;
    cards: Card[];
};
