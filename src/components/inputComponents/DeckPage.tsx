import React, { useState, useEffect, useRef, createRef } from "react";
import { Card, CardRow, STATE } from "../../entity/types.ts";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase.ts";
import { useParams } from "react-router-dom";
import InputCategory from "./InputCategory.tsx";

interface CardBoxes {
    box0: number[];
    box1: number[];
    box2: number[];
    box3: number[];
}

export default function DeckPage() {
    const { deckId } = useParams<{ deckId: string }>();

    const [template, setTemplate] = useState<Card | null>(null)
    const [cards, setCards] = useState<Card[] | null>(null);
    const [cardIndex, setCardIndex] = useState<number>(0);
    const cardBoxes = useRef<CardBoxes>({
        box0: [],
        box1: [],
        box2: [],
        box3: [],
    });

    const inputRefs = useRef<React.RefObject<HTMLInputElement>[]>([]);

    const [categoryStates, setCategoryStates] = useState<boolean[]>([]);
    const [rowStates, setRowStates] = useState<STATE[]>([]);

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const docSnapshot = await getDoc(doc(db, `decks/${deckId}`));
                setTemplate(JSON.parse(docSnapshot.data()?.template))
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
            setCategoryStates([]);
            cards[cardIndex].categories.forEach((category) => {
                category.rows.forEach(() => {
                    inputRefs.current.push(createRef<HTMLInputElement>());
                    setRowStates((prev) => [...prev, STATE.ASK]);
                });
                setCategoryStates((prev) => [...prev, false]);
            });
        }

        // focusNextInput(-1, 1, false);
    }, [cards, cardIndex]);

    const getNextCard = () => {
        console.log("next card got");
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

        while (nextIndex !== inputIndex && rowStates[nextIndex] !== STATE.ASK) {
            nextIndex =
                (nextIndex + inputRefs.current.length + step) %
                inputRefs.current.length;
        }

        if (nextIndex === inputIndex && isRowAnswered) getNextCard();
        else inputRefs.current[nextIndex].current?.focus();
    };

    const updateRowState = (inputIndex: number, newState: STATE) => {
        setRowStates((prev) => {
            const newRowStates = structuredClone(prev);
            newRowStates[inputIndex] = newState;
            return newRowStates;
        });
    };

    const updateCategoryStates = (categoryIndex: number, newState: boolean) => {
        setCategoryStates((prev) => {
            const newCategoryStates = structuredClone(prev);
            newCategoryStates[categoryIndex] = newState;
            return newCategoryStates;
        });
    };

    const handleKeyDown = (
        inputIndex: number,
        event: React.KeyboardEvent<HTMLInputElement>,
        row: CardRow
    ) => {
        const value = event.currentTarget.value;
        const isAnswerCorrect =
            (row._isCaseSensitive && value === row.answer) ||
            (!row._isCaseSensitive &&
                value.toUpperCase() === row.answer.toUpperCase());

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
                <>
                    {cards[cardIndex].categories.map(
                        (category, categoryIndex) => {
                            const thisStartIndex = startIndex;
                            startIndex += category.rows.length;

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
                                    startIndex={thisStartIndex}
                                    updateCategoryStates={(
                                        newState: boolean
                                    ) => {
                                        updateCategoryStates(
                                            categoryIndex,
                                            newState
                                        );
                                    }}
                                    handleKeyDown={handleKeyDown}
                                    key={`category ${categoryIndex}`}
                                />
                            );
                        }
                    )}
                </>
            ) : (
                <p>Loading...</p>
            )}
        </>
    );
}
