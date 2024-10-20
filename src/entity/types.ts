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

// export type CardRows = {
//     [key: string]: number[] | string[];
// };

// export type Card = {
//     [key: string]: CardRows;
// };

export type TemplateCategory = {
    _dependencies: string[];
    _isOrdered: boolean;
    _isSequential: boolean;
    name: string;
    rows: {
        label: string;
        _type: ROWTYPE;
        _isCaseSensitive: boolean;
    }[];
};

export type TemplateCard = {
    categories: TemplateCategory[];
};

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
    rows: CardRow[];
};

export type Card = {
    [key: string]: {
        _dependencies: string[];
        _isOrdered: boolean;
        _isSequential: boolean;
        rows: {
            label: string;
            answer: string;
            _type: "string" | "number";
            _isCaseSensitive: boolean;
        }[];
    };
};

export type Deck = {
    id: string;
    name: string;
    cards: Card[];
};

export class InputNode {
    inputRef: React.RefObject<HTMLInputElement>;
    _state: STATE;
    onStateChange: () => void = () => {};
    prevNode: InputNode;
    nextNode: InputNode;
    parentList: InputNodeList;

    constructor(
        inputRef: React.RefObject<HTMLInputElement>,
        state: STATE,
        parentList: InputNodeList
    ) {
        this.inputRef = inputRef;
        this._state = state;
        this.prevNode = this.nextNode = this;
        this.parentList = parentList;
    }

    get state() {
        return this._state;
    }

    set state(value: STATE) {
        this._state = value;
        this.onStateChange();
    }

    setOnStateChange(callback: () => void) {
        this.onStateChange = callback;
    }

    step(step: 1 | -1): void {
        if (step === 1) {
            this.nextNode.step_next(step, this);
            return;
        }

        this.prevNode.step_next(step, this);
    }

    step_next(step: 1 | -1, start: InputNode): void {
        if (this.state === STATE.ASK) {
            if (this.inputRef.current === null)
                throw new Error("inputRef is null");

            this.inputRef.current.select();
            return;
        }

        if (this === start) {
            this.parentList.getNextCard();
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
    catStates: Record<string, boolean[]>;
    getNextCard: () => void;
    length: number;
    arr: InputNode[];

    constructor(getNextCard: () => void) {
        this.head = this.tail = null;
        this.catStates = {};
        this.getNextCard = getNextCard;
        this.length = 0;
        this.arr = [];
    }

    get isEmpty(): boolean {
        return this.head === null;
    }

    add(InputNode: InputNode) {
        if (this.isEmpty) {
            this.head = this.tail = InputNode;
            this.head.prevNode = this.tail;
            this.head.nextNode = this.tail;
        } else {
            this.tail!.nextNode = InputNode;
            InputNode.prevNode = this.tail!;

            InputNode.nextNode = this.head!;
            this.head!.prevNode = InputNode;

            this.tail = InputNode;
        }
        this.arr.push(InputNode);
        this.length++;
    }

    toString() {
        return this.arr.map(
            (node, index) =>
                `${index}. ${node.inputRef.current!.value || "EMPTY"} | ${
                    node.state
                }`
        );
    }
}
