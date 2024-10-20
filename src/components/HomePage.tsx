import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { Deck } from "../entity/types";
import { Link } from "react-router-dom";
import styles from "./homePageStyles.module.css";

export default function HomePage() {
    const [allDecks, setAllDecks] = useState<Deck[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchAllDecks = async () => {
            const querySnapshot = await getDocs(collection(db, "decks"));
            setAllDecks(
                querySnapshot.docs.map((doc) => {
                    return {
                        ...(doc.data() as Deck),
                        id: doc.id,
                    };
                })
            );
        };

        fetchAllDecks()
            .then(() => {
                setIsLoading(false);
            })
            .catch((e) => {
                console.error("Error fetching all decks", e);
            });
    }, []);

    return (
        <>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <>
                    {allDecks.map((deck) => (
                        <Link
                            className={styles.DeckLink}
                            to={`/deck/${deck.id}`}
                            key={deck.id}
                        >
                            <p>{`${deck.id}: ${deck.name}`}</p>
                        </Link>
                    ))}
                    <Link className={styles.DeckLink} to={`/edit/new`}>
                        new deck
                    </Link>
                </>
            )}
        </>
    );
}
