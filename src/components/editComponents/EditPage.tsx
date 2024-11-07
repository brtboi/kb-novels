import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "../../entity/types";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import EditCard from "./EditCard";
import classNames from "classnames";
import styles from "./editStyles.module.css";

export default function EditPage() {
    const { deckId } = useParams<{ deckId: string }>();

    const [deckName, setDeckName] = useState<string | null>(null);
    const [templateCard, setTemplateCard] = useState<Card | null>(null);
    const [cards, setCards] = useState<Card[] | null>(null);

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const docSnapshot = await getDoc(doc(db, `decks/${deckId}`));
                const data = docSnapshot.data();

                setDeckName(data?.name);
                setTemplateCard(JSON.parse(data?.template));
                setCards(JSON.parse(data?.cards));
            } catch (e) {
                console.error("Error fetching CARDS", e);
            }
        };

        if (deckId === "new") {
            setDeckName("");
            setTemplateCard({ categories: [] });
            setCards([]);
        } else {
            fetchCards();
        }

    }, [deckId]);

    const handleSaveDeck = async () => {
        try {
            const docRef = await addDoc(collection(db, "decks"), {
                name: deckName,
                template: JSON.stringify(templateCard),
                cards: JSON.stringify(cards)
            });

            console.log("Doc created successfully with ID:", docRef.id)
        } catch (error) {
            console.error("Error saving deck to db:", error);
        }
    };

    const updateTemplateCard = (newCard: Card) => {
        setTemplateCard(newCard);
    };

    const updateCard = (cardIndex: number, newCard: Card) => {
        setCards((prev) => {
            const updatedCards = structuredClone(prev!);
            updatedCards[cardIndex] = newCard;
            return updatedCards;
        });
    };

    const addCard = () => {
        const newCard: Card = structuredClone(templateCard!);
        setCards((prev) => [...prev!, newCard]);
    };

    return (
        <>
            {deckName !== null && templateCard !== null && cards !== null ? (
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <input
                        className={classNames(styles.Input)}
                        value={deckName}
                        onChange={(e) => {
                            setDeckName(e.target.value);
                        }}
                    />
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
                    <button onClick={handleSaveDeck}>Save Deck</button>
                </div>
            ) : (
                <p>loading...</p>
            )}
        </>
    );
}
