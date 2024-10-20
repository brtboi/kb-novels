import React, { useState, useEffect } from "react";
import { Card } from "../../entity/types.ts";
import InputBody from "./InputBody.tsx";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase.ts";
import { useParams } from "react-router-dom";

export default function SetPage() {
    const { deckId } = useParams<{ deckId: string }>();

    const [cards, setCards] = useState<Card[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const docSnapshot = await getDoc(doc(db, `decks/${deckId}`));
                setCards(JSON.parse(docSnapshot.data()?.cards));
                setIsLoading(false);
            } catch (e) {
                console.error("Error fetching CARDS", e);
            }
        };

        fetchCards();
    }, [deckId]);

    return (
        <>{isLoading ? <p>LOADING...</p> : <InputBody cards={cards} />}</>
    );
}
