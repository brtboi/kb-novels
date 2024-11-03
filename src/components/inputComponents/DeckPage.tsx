import React, { useState, useEffect } from "react";
import { Card, STATE } from "../../entity/types.ts";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase.ts";
import { useParams } from "react-router-dom";
import InputCategory from "./InputCategory.tsx";

export default function DeckPage() {
    const { deckId } = useParams<{ deckId: string }>();

    const [cards, setCards] = useState<Card[] | null>(null);
    const [cardIndex, setCardIndex] = useState<number>(0);

    const [inputRefs, setInputRefs] = useState<
        React.RefObject<HTMLInputElement>[]
    >([]);

    const [categoryStates, setCategoryStates] = useState<boolean[]>([]);
    const [rowStates, setRowStates] = useState<STATE[]>([]);

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const docSnapshot = await getDoc(doc(db, `decks/${deckId}`));
                setCards(JSON.parse(docSnapshot.data()?.cards));
            } catch (e) {
                console.error("Error fetching CARDS", e);
            }
        };

        fetchCards();
    }, [deckId]);

    const addInputRef = (ref: React.RefObject<HTMLInputElement>) => {
        setInputRefs((prev) => [...prev, ref]);
        return inputRefs.length;
    };

    const focusNextInput = (index: number, step: -1 | 1) => {
        const nextIndex = (index + inputRefs.length + step) % inputRefs.length;
        const nextRef = inputRefs[nextIndex].current;
        if (nextRef) nextRef.focus();
        else console.log(`Error: next inputRef at index ${nextIndex} is null`);
    };

    return (
        <>
            {cards !== null ? (
                <>
                    {cards[cardIndex].categories.map((category) => 
                        <InputCategory
                            category={category}
                            addInputRef={addInputRef}
                            focusNextInput={focusNextInput}
                        />
                    )}
                </>
            ) : (
                <p>Loading...</p>
            )}
        </>
    );
}
