export enum STATES {
    ASK = "ask",
    SHOW = "show",
    HIDE = "hide",
    CORRECT = "correct",
    INCORRECT = "incorrect",
}

export type CardRows = {
    [key: string]: number[] | string[];
};

export type Card = {
    [key: string]: CardRows;
};
