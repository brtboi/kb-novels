import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, TemplateCard } from "../../entity/types";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import EditBody from "./EditBody";
import { EditContext } from "../../entity/contexts";
import EditCard from "./EditCard";

export default function EditPage() {
    const { deckId } = useParams<{ deckId: string }>();
    const templateRef = useRef<Card | null>(null);
    const cardsRef = useRef<Card[] | null>(null);

    const [templateCard, setTemplateCard] = useState<Card | null>(null);
    const [cards, setCards] = useState<Card[] | null>(null);
    const [, setUpdate] = useState<number>(0);

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const docSnapshot = await getDoc(doc(db, `decks/${deckId}`));
                templateRef.current = JSON.parse(docSnapshot.data()?.template);
                cardsRef.current = JSON.parse(docSnapshot.data()?.cards);

                setTemplateCard(JSON.parse(docSnapshot.data()?.template));
                setCards(JSON.parse(docSnapshot.data()?.cards));
            } catch (e) {
                console.error("Error fetching CARDS", e);
            }
        };

        if (deckId === "new") {
            templateRef.current = { categories: [] };
            cardsRef.current = [];

            setTemplateCard({ categories: [] });
            setCards([]);
        } else {
            fetchCards();
        }

        setUpdate((prev) => prev + 1);
    }, [deckId]);

    const updateTemplateCard = (newCard: Card) => {
        setTemplateCard(newCard);
    };

    return (
        <>
            {templateCard !== null ? (
                // <EditContext.Provider value={{ templateRef, cardsRef }}>
                //     {/* <EditBody /> */}
                // </EditContext.Provider>
                <div style={{display: "flex", flexDirection: "column"}}>
                    <EditCard
                        card={templateCard}
                        updateCard={updateTemplateCard}
                        isTemplate={true}
                    />
                    <button
                        onClick={() => {
                            console.log(templateCard);
                        }}
                    >
                        print template
                    </button>
                    <button
                        onClick={() => {
                            console.log(cards);
                        }}
                    >
                        print cards
                    </button>
                </div>
            ) : (
                <p>loading...</p>
            )}
        </>
    );
}
