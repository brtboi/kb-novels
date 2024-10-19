import React, { useState, useEffect } from "react";
import { Card } from "../../entity/types.ts";
import InputBody from "./InputBody.tsx";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase.ts";
import { useParams } from "react-router-dom";

export default function SetPage() {
    const { deckId } = useParams<{ deckId: string }>();

    const [CARDSArr, setCARDSArr] = useState<Card[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchCARDSArr = async () => {
            try {
                const docSnapshot = await getDoc(doc(db, `decks/${deckId}`));
                setCARDSArr(JSON.parse(docSnapshot.data()?.CARDSArr));
                setIsLoading(false);
            } catch (e) {
                console.error("Error fetching CARDS", e);
            }
        };

        fetchCARDSArr();
    }, [deckId]);

    return (
        <>{isLoading ? <p>LOADING...</p> : <InputBody CARDSArr={CARDSArr} />}</>
    );
}
