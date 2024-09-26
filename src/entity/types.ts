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

export type Deck = {
    id: string;
    name: string;
    CARDSArr: Card[];
};

export class InputNode {
    inputRef: React.RefObject<HTMLInputElement>;
    state: STATES;
    prevNode: InputNode;
    nextNode: InputNode;

    constructor(inputRef: React.RefObject<HTMLInputElement>, state: STATES) {
        this.inputRef = inputRef;
        this.state = state;
        this.prevNode = this.nextNode = this;
    }

    step(step: 1 | -1): void {
        if (step === 1) {
            this.nextNode.step_next(step, this);
            return;
        }

        this.prevNode.step_next(step, this);
    }

    step_next(step: 1 | -1, start: InputNode): void {
        if (this.state === STATES.ASK) {
            if (this.inputRef.current === null)
                throw new Error("inputRef is null");

            this.inputRef.current.select();
            return;
        }

        if (this === start) {
            console.log("next book");
            return;
        }

        if (step === 1) {
            this.nextNode.step_next(step, start);
        } else if (step === -1) {
            this.prevNode.step_next(step, start);
        }
    }
}

export class InputNodeList {
    head: InputNode | null;
    tail: InputNode | null;
    length: number;

    constructor() {
        this.head = this.tail = null;
        this.length = 0;
    }

    get isEmpty(): boolean {
        return this.head === null;
    }

    add(InputNode: InputNode) {
        if (this.isEmpty) {
            this.head = this.tail = InputNode;
        } else {
            this.tail!.nextNode = InputNode;
            InputNode.prevNode = this.tail!;

            InputNode.nextNode = this.head!;
            this.head!.prevNode = InputNode;

            this.tail = InputNode;
        }

        this.length++;
    }
}
