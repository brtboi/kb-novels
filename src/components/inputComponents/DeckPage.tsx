import React, { useState, useEffect, useRef, createRef } from "react";
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

    const [updateVariable, setUpdateVariable] = useState<number>(0);

    const [template, setTemplate] = useState<Card | null>(null);
    const [cards, setCards] = useState<Card[] | null>(null);
    const [cardIndex, setCardIndex] = useState<number>(0);
    const cardBoxes = useRef<CardBoxes>({
        box0: [],
        box1: [],
        box2: [],
        box3: [],
    });

    const inputRefs = useRef<React.RefObject<HTMLInputElement>[]>([]);

    const [categoryStates, setCategoryStates] = useState<
        Record<string, boolean>
    >({});
    const [rowStates, setRowStates] = useState<STATE[]>([]);
    const [isCardDone, setIsCardDone] = useState<boolean>(false);

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const docSnapshot = await getDoc(doc(db, `decks/${deckId}`));
                setTemplate(JSON.parse(docSnapshot.data()?.template));
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

    // Define inputRefs, rowStates, and categorySubmitted
    useEffect(() => {
        if (cards) {
            inputRefs.current = [];
            setRowStates([]);
            setCategoryStates({});
            cards[cardIndex].categories.forEach((category) => {
                category.rows.forEach(() => {
                    inputRefs.current.push(createRef<HTMLInputElement>());
                    setRowStates((prev) => [...prev, STATE.ASK]);
                });
                setCategoryStates((prev) => ({
                    ...prev,
                    [category._ID]: false,
                }));
            });

            setUpdateVariable((prev) => prev + 1);
        }
    }, [cards, cardIndex]);

    useEffect(() => {
        if (cards && inputRefs.current.length > 0 && rowStates.length > 0) {
            focusNextInput(inputRefs.current.length - 1, 1, false);
        }
    }, [cards, cardIndex, updateVariable]);

    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" && isCardDone) getNextCard();
        };

        document.addEventListener("keydown", handleGlobalKeyDown);
        return () =>
            document.removeEventListener("keydown", handleGlobalKeyDown);
    });

    const getNextCard = () => {
        setIsCardDone(false);
        setCardIndex((prev) => (prev + 1) % cards!.length);
        // setCardIndex(Math.floor(cards!.length * Math.random()));
    };

    const focusNextInput = (
        inputIndex: number,
        step: -1 | 1,
        isRowAnswered: boolean
    ) => {
        let nextIndex =
            (inputIndex + inputRefs.current.length + step) %
            inputRefs.current.length;
        console.log("from while loop", nextIndex, rowStates[nextIndex]);
        while (nextIndex !== inputIndex && rowStates[nextIndex] !== STATE.ASK) {
            console.log("from while loop", rowStates[nextIndex]);
            nextIndex =
                (nextIndex + inputRefs.current.length + step) %
                inputRefs.current.length;
        }

        if (nextIndex === inputIndex && isRowAnswered) {
            setTimeout(() => {
                setIsCardDone(true);
            }, 10);
        }

        inputRefs.current[nextIndex].current?.focus();
    };

    const updateRowState = (inputIndex: number, newState: STATE) => {
        setRowStates((prev) => {
            const newRowStates = structuredClone(prev);
            newRowStates[inputIndex] = newState;
            return newRowStates;
        });
    };

    const updateCategoryStates = (categoryID: string, newState: boolean) => {
        if (newState !== categoryStates[categoryID]) {
            setCategoryStates((prev) => {
                const newCategoryStates = structuredClone(prev);
                newCategoryStates[categoryID] = newState;
                return newCategoryStates;
            });
        }
    };

    const handleKeyDown = (
        inputIndex: number,
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
                    focusNextInput(inputIndex!, 1, false);
                } else if (isAnswerCorrect) {
                    inputRefs.current[inputIndex].current!.value = "";
                    updateRowState(inputIndex, STATE.CORRECT);
                    focusNextInput(inputIndex!, 1, isAnswerCorrect);
                } else if (value === "idk") {
                    inputRefs.current[inputIndex].current!.value = "";
                    updateRowState(inputIndex, STATE.INCORRECT);
                    focusNextInput(inputIndex!, 1, true);
                } else {
                    inputRefs.current[inputIndex].current?.select();
                }

                break;

            case "ArrowUp":
                event.preventDefault();
                focusNextInput(inputIndex, -1, false);
                break;

            case "ArrowDown":
                event.preventDefault();
                focusNextInput(inputIndex, 1, false);
                break;
        }
    };

    let startIndex = 0;

    return (
        <>
            {cards !== null ? (
                <div className={classNames(styles.InputBody)}>
                    {cards[cardIndex].categories.map(
                        (category, categoryIndex) => {
                            const thisStartIndex = startIndex;
                            startIndex += category.rows.length;

                            if (
                                category._dependencies.every((ID) => {
                                    return categoryStates[ID] === true;
                                })
                            ) {
                                return (
                                    <InputCategory
                                        category={category}
                                        inputRefs={inputRefs.current.slice(
                                            thisStartIndex,
                                            startIndex
                                        )}
                                        rowStates={rowStates.slice(
                                            thisStartIndex,
                                            startIndex
                                        )}
                                        updateCategoryStates={(
                                            newState: boolean
                                        ) => {
                                            updateCategoryStates(
                                                category._ID,
                                                newState
                                            );
                                        }}
                                        handleKeyDown={(
                                            rowIndex: number,
                                            event: React.KeyboardEvent<HTMLInputElement>,
                                            row: CardRow
                                        ) => {
                                            handleKeyDown(
                                                thisStartIndex + rowIndex,
                                                event,
                                                row
                                            );
                                        }}
                                        key={`category ${categoryIndex}`}
                                    />
                                );
                            } else {
                                return null;
                            }
                        }
                    )}
                    <button onClick={getNextCard}>next Card</button>
                    <button
                        onClick={() => {
                            console.log(categoryStates);
                        }}
                    >
                        cateStates
                    </button>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </>
    );
}
