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
   type: RowType;
   cased: boolean;
};

export type CardCategory = {
   _ID: string;
   deps: string[];
   shfl: boolean;
   seq: boolean;
   name: string;
   rows: CardRow[];
};

export type Card = {
   cats: CardCategory[];
};

export type Deck = {
   id: string;
   name: string;
   template: Card;
   cards: Card[];
};
