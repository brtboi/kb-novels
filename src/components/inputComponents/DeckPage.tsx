import React, {
    useState,
    useEffect,
    useRef,
    createRef,
    useCallback,
} from "react";
import { Card, CardRow, STATE } from "../../entity/types.ts";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase.ts";
import { useParams } from "react-router-dom";
import InputCategory from "./InputCategory.tsx";
import classNames from "classnames";
import styles from "./inputStyles.module.css";

interface CardBoxes {
    box0: number[];
    box1: number[];
    box2: number[];
    box3: number[];
}

export default function DeckPage() {
    const { deckId } = useParams<{ deckId: string }>();

    const [shouldFocusFirstInput, setShouldFocusFirstInput] =
        useState<boolean>(false);

    const [cards, setCards] = useState<Card[] | null>(null);
    const [cardIndex, setCardIndex] = useState<number>(0);
    const cardBoxes = useRef<CardBoxes>({
        box0: [],
        box1: [],
        box2: [],
        box3: [],
    });

    const inputRefs = useRef<Map<string, React.RefObject<HTMLInputElement>[]>>(
        new Map()
    );
    const [rowStates, setRowStates] = useState<Map<string, STATE[]>>(new Map());

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

    const [isCardDone, setIsCardDone] = useState<boolean>(false);

    const getNextCard = () => {
        setIsCardDone(false);
        setCardIndex((prev) => (prev + 1) % cards!.length);
        // setCardIndex(Math.floor(cards!.length * Math.random()));
    };

    const focusNextInput = useCallback(
        (
            categoryID: string,
            rowIndex: number,
            step: -1 | 1,
            isRowAnswered: boolean
        ) => {
            const inputRefsFlat = Array.from(inputRefs.current.values()).flat();
            const rowStatesFlat = Array.from(rowStates.values()).flat();

            const flatIndex = getFlatIndex(categoryID, rowIndex);

            let nextIndex =
                (flatIndex + inputRefsFlat.length + step) %
                inputRefsFlat.length;

            while (
                nextIndex !== flatIndex &&
                rowStatesFlat[nextIndex] !== STATE.ASK
            ) {
                nextIndex =
                    (nextIndex + inputRefsFlat.length + step) %
                    inputRefsFlat.length;
            }

            if (nextIndex === flatIndex && isRowAnswered) {
                setTimeout(() => {
                    setIsCardDone(true);
                }, 10);
            }

            inputRefsFlat[nextIndex].current?.focus();
        },
        [getFlatIndex, rowStates]
    );

    const updateRowState = (
        categoryID: string,
        rowIndex: number,
        newState: STATE
    ) => {
        setRowStates((prev) => {
            const updatedRowStates = new Map(prev);
            const updatedRowStatesRow = prev.get(categoryID)!;

            updatedRowStatesRow[rowIndex] = newState;

            updatedRowStates.set(categoryID, updatedRowStatesRow);
            return updatedRowStates;
        });
    };

    const handleKeyDown = (
        categoryID: string,
        rowIndex: number,
        event: React.KeyboardEvent<HTMLInputElement>,
        row: CardRow
    ) => {
        const value = event.currentTarget.value;
        const isAnswerCorrect =
            (row._isCaseSensitive && row.answers.some((e) => e === value)) ||
            (!row._isCaseSensitive &&
                row.answers.some(
                    (e) => e.toUpperCase() === value.toUpperCase()
                ));

        switch (event.key) {
            case "Enter":
                event.preventDefault();
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
                    updateRowState(categoryID, rowIndex, STATE.INCORRECT);
                    focusNextInput(categoryID, rowIndex, 1, true);
                    //
                } else {
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

    //fetch Cards from firestore
    useEffect(() => {
        const fetchCards = async () => {
            try {
                const docSnapshot = await getDoc(doc(db, `decks/${deckId}`));
                setCards(JSON.parse(docSnapshot.data()?.cards));

                // puts indices 0 to nCards - 1 into box0
                cardBoxes.current.box0 = Array.from(
                    docSnapshot.data()?.cards,
                    (_, index) => index
                );
            } catch (e) {
                console.error("Error fetching CARDS", e);
            }
        };

        fetchCards();
    }, [deckId]);

    // Define inputRefs, rowStates
    useEffect(() => {
        if (cards) {
            inputRefs.current = new Map();
            // setRowStates([]);
            // setCategoryStates({});
            setRowStates(new Map());

            cards[cardIndex].categories.forEach((category) => {
                setRowStates((prev) => {
                    const updatedRowStates = new Map(prev);

                    updatedRowStates.set(
                        category._ID,
                        category.rows.map((_) => STATE.ASK)
                    );

                    return updatedRowStates;
                });

                inputRefs.current.set(
                    category._ID,
                    category.rows.map((_) => createRef<HTMLInputElement>())
                );
            });

            setShouldFocusFirstInput(true);
        }
    }, [cards, cardIndex]);

    // focus first input
    useEffect(() => {
        if (
            shouldFocusFirstInput &&
            cards !== null &&
            inputRefs.current.size !== 0 &&
            rowStates.size !== 0
        ) {
            const firstCategoryID = Array.from(inputRefs.current.keys())[0];
            focusNextInput(firstCategoryID, -1, 1, false);
            setShouldFocusFirstInput(false);
        }
    }, [cards, cardIndex, focusNextInput, rowStates.size]);

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
