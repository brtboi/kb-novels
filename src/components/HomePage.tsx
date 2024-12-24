import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { Deck } from "../entity/types";
import { Link } from "react-router-dom";
import styles from "./homePageStyles.module.scss";
import classNames from "classnames";

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
                <div className={styles.HomePageDiv}>
                    {allDecks.map((deck) => (
                        <div
                            className={classNames(styles.HomePageRow)}
                            key={deck.id}
                        >
                            <Link
                                to={`/deck/${deck.id}`}
                                className={styles.DeckLink}
                            >
                                {`${deck.id}: ${deck.name}`}
                            </Link>
                            <Link
                                to={`/edit/${deck.id}`}
                                className={classNames(styles.DeckLink)}
                            >
                                edit
                            </Link>
                        </div>
                    ))}
                    <Link to={`/edit/new`} className={styles.DeckLink}>
                        new deck
                    </Link>
                    <Link to={`/test`} className={styles.DeckLink}>Test page</Link>
                </div>
            )}
        </>
    );
}
