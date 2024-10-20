import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "../../entity/types";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { TemplateCard } from "./editTypes";
import EditBody from "./EditBody";
import { EditContext } from "../../entity/contexts";

export default function EditPage() {
    const { deckId } = useParams<{ deckId: string }>();
    const templateRef = useRef<TemplateCard | null>(null);
    const cardsRef = useRef<Card[] | null>(null);
    const [, setUpdate] = useState<number>(0);
    const rerender = () => {
        setUpdate((prev) => prev + 1);
    };

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const docSnapshot = await getDoc(doc(db, `decks/${deckId}`));
                templateRef.current = JSON.parse(docSnapshot.data()?.template);
                cardsRef.current = JSON.parse(docSnapshot.data()?.cards);
            } catch (e) {
                console.error("Error fetching CARDS", e);
            }
        };

        if (deckId === "new") {
            templateRef.current = { categories: [] };
            cardsRef.current = [];
        } else {
            fetchCards();
        }

        rerender();
    }, [deckId]);

    return (
        <>
            {cardsRef.current !== null && templateRef.current !== null ? (
                <EditContext.Provider
                    value={{ templateRef, cardsRef, rerender }}
                >
                    <EditBody />
                </EditContext.Provider>
            ) : (
                <p>loading...</p>
            )}
        </>
    );
}
