import React, {
    useState,
    useEffect,
    useRef,
    createRef,
    useCallback,
} from "react";
import { Card, CardRow, RowType, STATE } from "../../entity/types.ts";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase.ts";
import { useParams } from "react-router-dom";
import InputCategory from "./InputCategory.tsx";
import classNames from "classnames";
import styles from "./inputStyles.module.css";

type Suit = 0 | 1 | 2 | 3;

type DrawPileItem = {
    cardIndex: number;
    suit: Suit;
    suitIndex: number;
};

export default function DeckPage() {
    const { deckId } = useParams<{ deckId: string }>();

    const [isFirstLoaded, setIsFirstLoaded] = useState<boolean>(false);

    const [cards, setCards] = useState<Card[] | null>(null);
    const [cardIndex, setCardIndex] = useState<number>(0);
    const cardSuits = useRef<number[][]>([[], [], [], []]);

    const drawPile = useRef<DrawPileItem[]>([]);
    const cardPerformance = useRef<-1 | 0 | 1>(1);

    const inputRefs = useRef<Map<string, React.RefObject<HTMLInputElement>[]>>(
        new Map()
    );
    const _isSequential = useRef<Record<string, boolean>>({});
    const _dependencies = useRef<Record<string, string[]>>({});

    const [rowStates, setRowStates] = useState<Map<string, STATE[]>>(new Map());

    const [isCardDone, setIsCardDone] = useState<boolean>(false);

    const moveCard = (fromSuit: Suit, suitIndex: number, toSuit: Suit) => {
        const [cardIndex] = cardSuits.current[fromSuit].splice(suitIndex, 1);
        cardSuits.current[toSuit].push(cardIndex);
    };

    const getFlatIndex = useCallback(
        (categoryID: string, rowIndex: number) => {
            let index = 0;

            for (const category of cards![cardIndex].categories) {
                if (category._ID === categoryID) {
                    index += rowIndex;
                    break;
                }

                index += category.rows.length;
            }

            return index;
        },
        [cards, cardIndex]
    );

    const getIsAnswerCorrect = useCallback((value: string, row: CardRow) => {
        if (row._type === "name") {
            const allPossibleNames = [];

            for (const name of row.answers) {
                const words = name.trim().split(/\s+/); // Split full name into words

                // Generate all viable "last names" for this full name
                for (let i = 1; i <= words.length; i++) {
                    allPossibleNames.push(words.slice(-i).join(" "));
                }
            }

            return allPossibleNames.some((e) =>
                row._isCaseSensitive
                    ? e === value
                    : e.toUpperCase() === value.toUpperCase()
            );
        } else if (row._type === "text") {
            return row.answers.some((e) =>
                row._isCaseSensitive
                    ? e === value
                    : e.toUpperCase() === value.toUpperCase()
            );
        } else if (row._type === "number") {
            return row.answers.some((e) => parseFloat(e) === parseFloat(value));
        }
    }, []);

    const focusNextInput = useCallback(
        (
            categoryID: string,
            rowIndex: number,
            step: -1 | 1,
            isRowAnswered: boolean
        ) => {
            const inputRefsFlat = Array.from(inputRefs.current.values()).flat();

            setRowStates((prev) => {
                const flatIndex = getFlatIndex(categoryID, rowIndex);
                const rowStatesFlat = Array.from(prev.values()).flat();

                let nextIndex =
                    (flatIndex + inputRefsFlat.length + step) %
                    inputRefsFlat.length;

                while (
                    nextIndex !== flatIndex &&
                    rowStatesFlat[nextIndex] !== STATE.ASK
                ) {
                    console.log("in the while loop");
                    nextIndex =
                        (nextIndex + inputRefsFlat.length + step) %
                        inputRefsFlat.length;
                }

                if (nextIndex === flatIndex && isRowAnswered) {
                    setTimeout(() => {
                        setIsCardDone(true);
                    }, 10);
                }

                setTimeout(() => {
                    inputRefsFlat[nextIndex].current?.focus();
                });
                return prev;
            });
        },
        [getFlatIndex]
    );

    const updateRowState = (
        categoryID: string,
        rowIndex: number,
        newState: STATE
    ) => {
        setRowStates((prev) => {
            const updatedRowStates = structuredClone(prev);
            const updatedRowStatesCategory = [...prev.get(categoryID)!];

            updatedRowStatesCategory[rowIndex] = newState;

            updatedRowStates.set(categoryID, updatedRowStatesCategory);
            return updatedRowStates;
        });
        checkIsSequential();
        checkDependencies();
    };

    // const updateCategoryState = (categoryID: string, newState: STATE) => {
    //     setRowStates((prev) => {
    //         const updatedRowStates = new Map(prev);
    //         const updatedRowStatesCategory = prev
    //             .get(categoryID)!
    //             .map((_) => newState);
    //         updatedRowStates.set(categoryID, updatedRowStatesCategory);
    //         return updatedRowStates;
    //     });
    // };

    const checkIsSequential = useCallback(() => {
        if (!cards) {
            console.error("Error: cards is null");
            return;
        }

        setRowStates((prev) => {
            const updatedRowStates = structuredClone(prev);

            for (const category of cards[cardIndex].categories) {
                if (category._isSequential) {
                    const states = updatedRowStates.get(category._ID)!;

                    for (let i = 1; i < states.length; i++) {
                        if (
                            states[i] === STATE.HIDE &&
                            (states[i - 1] === STATE.CORRECT ||
                                states[i - 1] === STATE.INCORRECT)
                        ) {
                            const _rowStatesTemp = [...prev.get(category._ID)!];
                            _rowStatesTemp[i] = STATE.ASK;

                            updatedRowStates.set(category._ID, _rowStatesTemp);
                            break;
                        }
                    }
                }
            }

            return updatedRowStates;
        });
    }, [cards, cardIndex]);

    const checkDependencies = useCallback(() => {
        if (!cards) {
            console.error("Error: cards is null");
            return;
        }

        setRowStates((prev) => {
            const updatedRowStates = structuredClone(prev);

            const categoryStates = prev.entries().reduce(
                (acc, [categoryID, states]) => ({
                    ...acc,
                    [categoryID]: states.every(
                        (e) => e !== STATE.ASK && e !== STATE.HIDE
                    ),
                }),
                {} as Record<string, boolean>
            );

            // const dependencies = cards[cardIndex].categories.reduce(
            //     (acc, category) => ({
            //         ...acc,
            //         [category._ID]: category._dependencies,
            //     }),
            //     {} as Record<string, string[]>
            // );

            for (const category of cards[cardIndex].categories) {
                // if the category is currently hidden and all of it's dependencies are fulfilled
                if (
                    prev
                        .get(category._ID)
                        ?.every((state) => state === STATE.HIDE) &&
                    _dependencies.current[category._ID].every(
                        (dependencyID) => categoryStates[dependencyID]
                    )
                ) {
                    if (category._isSequential) {
                        updatedRowStates.set(
                            category._ID,
                            prev
                                .get(category._ID)!
                                .map((_, i) =>
                                    i === 0 ? STATE.ASK : STATE.HIDE
                                )
                        );
                    } else {
                        updatedRowStates.set(
                            category._ID,
                            prev.get(category._ID)!.map(() => STATE.ASK)
                        );
                    }
                }
            }

            // prev.keys().forEach((categoryID) => {
            //     // if the category is currently hidden and all of it's dependencies are fulfilled
            //     if (
            //         prev
            //             .get(categoryID)
            //             ?.every((state) => state === STATE.HIDE) &&
            //         _dependencies.current[categoryID].every(
            //             (dependencyID) => categoryStates[dependencyID]
            //         )
            //     ) {

            //         updatedRowStates.set(
            //             categoryID,
            //             prev.get(categoryID)!.map(() => STATE.ASK)
            //         );
            //     } else {
            //         updatedRowStates.set(categoryID, prev.get(categoryID)!);
            //     }
            // });

            return updatedRowStates;
        });
    }, [cards, cardIndex]);

    const refillDrawPile = useCallback(() => {
        // move 5 cards to diamonds to clubs
        while (
            cardSuits.current[0].length > 0 &&
            cardSuits.current[1].length < 5
        ) {
            const randomIndex = Math.floor(
                Math.random() * cardSuits.current[0].length
            );

            moveCard(0, randomIndex, 1);
        }

        // refill drawPile with diamonds, hearts, and 5 cards from spades
        if (drawPile.current.length === 0) {
            const suit3Cards: DrawPileItem[] = [];

            while (
                suit3Cards.length < Math.min(5, cardSuits.current[3].length)
            ) {
                const randomIndex = Math.floor(
                    Math.random() * cardSuits.current[3].length
                );
                suit3Cards.push({
                    cardIndex: cardSuits.current[3][randomIndex],
                    suit: 3,
                    suitIndex: randomIndex,
                });
            }

            drawPile.current.push(
                ...suit3Cards,
                ...cardSuits.current[2].map((cardIndex, suitIndex) => ({
                    cardIndex: cardIndex,
                    suit: 2 as Suit,
                    suitIndex: suitIndex,
                })),
                ...cardSuits.current[1].map((cardIndex, suitIndex) => ({
                    cardIndex: cardIndex,
                    suit: 1 as Suit,
                    suitIndex: suitIndex,
                }))
            );
        }
    }, []);

    const getNextCard = useCallback(() => {
        setIsCardDone(false);
        if (drawPile.current.length === 0) refillDrawPile();
        else {
            const currentCard = drawPile.current.pop()!;

            const toSuit =
                currentCard.suitIndex + cardPerformance.current < 1
                    ? 1
                    : currentCard.suitIndex + cardPerformance.current > 3
                    ? 3
                    : ((currentCard.suitIndex +
                          cardPerformance.current) as Suit);

            moveCard(currentCard.suit, currentCard.suitIndex, toSuit);

            if (drawPile.current.length === 0) refillDrawPile();

            setCardIndex(drawPile.current[0].cardIndex);
            cardPerformance.current = 1;
        }

        // setCardIndex(Math.floor(cards!.length * Math.random()));
    }, [refillDrawPile]);

    const handleKeyDown = (
        categoryID: string,
        rowIndex: number,
        event: React.KeyboardEvent<HTMLInputElement>,
        row: CardRow
    ) => {
        const value = event.currentTarget.value;
        switch (event.key) {
            case "Enter":
                event.preventDefault();
                const isAnswerCorrect = getIsAnswerCorrect(value, row)

                if (value === "") {
                    focusNextInput(categoryID, rowIndex, 1, false);
                    //
                } else if (isAnswerCorrect) {
                    inputRefs.current.get(categoryID)![
                        rowIndex
                    ].current!.value = "";
                    updateRowState(categoryID, rowIndex, STATE.CORRECT);

                    focusNextInput(categoryID, rowIndex, 1, isAnswerCorrect);
                    //
                } else if (value === "idk") {
                    inputRefs.current.get(categoryID)![
                        rowIndex
                    ].current!.value = "";
                    cardPerformance.current = -1;
                    updateRowState(categoryID, rowIndex, STATE.INCORRECT);
                    focusNextInput(categoryID, rowIndex, 1, true);
                    //
                } else {
                    cardPerformance.current = 0;
                    inputRefs.current
                        .get(categoryID)!
                        [rowIndex].current?.select();
                }

                break;

            case "ArrowUp":
                event.preventDefault();
                focusNextInput(categoryID, rowIndex, -1, false);
                break;

            case "ArrowDown":
                event.preventDefault();
                focusNextInput(categoryID, rowIndex, 1, false);
                break;
        }
    };

    // fetch Cards from firestore and initialize cardSuits[0]
    useEffect(() => {
        const fetchCards = async () => {
            try {
                const docSnapshot = await getDoc(doc(db, `decks/${deckId}`));
                const cards = JSON.parse(docSnapshot.data()?.cards) as Card[];
                setCards(cards);

                // puts indices 0 to nCards - 1 into box0
                cardSuits.current[0] = cards.map((_, i) => i);
                getNextCard();
            } catch (e) {
                console.error("Error fetching CARDS", e);
            }
        };

        fetchCards();
    }, [deckId, getNextCard]);

    // Initialize inputRefs & rowStates & _dependencies & _isSequential
    useEffect(() => {
        if (cards) {
            const _inputRefs = new Map();
            let _rowStates = new Map();

            cards[cardIndex].categories.forEach((category) => {
                _inputRefs.set(
                    category._ID,
                    category.rows.map(() => createRef<HTMLInputElement>())
                );
                _rowStates.set(
                    category._ID,
                    category.rows.map(() => STATE.HIDE)
                );

                _dependencies.current[category._ID] = category._dependencies;
                _isSequential.current[category._ID] = category._isSequential;
            });

            inputRefs.current = new Map(_inputRefs);
            setRowStates(new Map(_rowStates));
            checkDependencies();

            setIsFirstLoaded(true);
        }
    }, [cards, cardIndex, checkDependencies]);

    // Focus First input
    useEffect(() => {
        if (isFirstLoaded && cards !== null) {
            const lastCategory =
                cards[cardIndex].categories[
                    cards[cardIndex].categories.length - 1
                ];
            focusNextInput(
                lastCategory._ID,
                lastCategory.rows.length - 1,
                1,
                false
            );
            setIsFirstLoaded(false);
        }
    }, [cardIndex, cards, focusNextInput, isFirstLoaded]);

    // global key down event listener for enter
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" && isCardDone) {
                getNextCard();
            }
        };

        document.addEventListener("keydown", handleGlobalKeyDown);
        return () =>
            document.removeEventListener("keydown", handleGlobalKeyDown);
    });

    return (
        <>
            {cards !== null &&
            inputRefs.current.size !== 0 &&
            rowStates.size !== 0 ? (
                <div className={classNames(styles.InputBody)}>
                    {cards[cardIndex].categories.map(
                        (category, categoryIndex) => {
                            return (
                                <InputCategory
                                    category={category}
                                    inputRefs={
                                        inputRefs.current.get(category._ID)!
                                    }
                                    rowStates={rowStates.get(category._ID)!}
                                    handleKeyDown={(
                                        rowIndex: number,
                                        event: React.KeyboardEvent<HTMLInputElement>,
                                        row: CardRow
                                    ) => {
                                        handleKeyDown(
                                            category._ID,
                                            rowIndex,
                                            event,
                                            row
                                        );
                                    }}
                                    key={`category ${categoryIndex}`}
                                />
                            );
                        }
                    )}
                    <button onClick={getNextCard}>next Card</button>
                    <button
                        onClick={() => {
                            console.log(rowStates);
                        }}
                    >
                        rowStates
                    </button>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </>
    );
}
