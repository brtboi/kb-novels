import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "../../entity/types";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import EditCard from "./EditCard";

export default function EditPage() {
    const { deckId } = useParams<{ deckId: string }>();

    const [templateCard, setTemplateCard] = useState<Card | null>(null);
    const [cards, setCards] = useState<Card[] | null>(null);
    const [, setUpdate] = useState<number>(0);

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const docSnapshot = await getDoc(doc(db, `decks/${deckId}`));

                setTemplateCard(JSON.parse(docSnapshot.data()?.template));
                setCards(JSON.parse(docSnapshot.data()?.cards));
            } catch (e) {
                console.error("Error fetching CARDS", e);
            }
        };

        if (deckId === "new") {
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

    const updateCard = (cardIndex: number, newCard: Card) => {
        setCards((prev) => {
            const updatedCards = prev!;
            updatedCards[cardIndex] = newCard;
            return updatedCards;
        });
    };

    // const handleAddCard = (cardIndex: number) => {
    //     const newCard: Card = structuredClone(templateCard!);
    //     const updatedCards = cards!;
    //     updatedCards.splice(cardIndex, 0, newCard);
    //     setCards(updatedCards);
    // };

    const addCard = () => {
        const newCard: Card = structuredClone(templateCard!);
        setCards((prev) => [...prev!, newCard]);
    };

    return (
        <>
            {templateCard !== null && cards !== null ? (
                // <EditContext.Provider value={{ templateRef, cardsRef }}>
                //     {/* <EditBody /> */}
                // </EditContext.Provider>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <p>Template:</p>
                    <EditCard
                        card={templateCard}
                        updateCard={updateTemplateCard}
                        isTemplate={true}
                    />
                    <p>Cards:</p>
                    {cards.map((card, cardIndex) => (
                        <EditCard
                            card={card}
                            updateCard={(newCard: Card) => {
                                updateCard(cardIndex, newCard);
                            }}
                            isTemplate={false}
                            key={`card ${cardIndex}`}
                        />
                    ))}
                    <button onClick={addCard}>add Card</button>
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
