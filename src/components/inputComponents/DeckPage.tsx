import React, { useState, useEffect } from "react";
import { CARDSContext } from "../../entity/contexts.ts";
import { Card } from "../../entity/types.ts";
import InputBody from "./InputBody.tsx";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase.ts";
import { useParams } from "react-router-dom";

export default function SetPage() {
    const { id } = useParams<{ id: string }>();

    const [CARDSArr, setCARDSArr] = useState<Card[]>([]);
    const [CARDSIndex, setCARDSIndex] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchCARDSArr = async () => {
            try {
                const docSnapshot = await getDoc(doc(db, `decks/${id}`));
                setCARDSArr(JSON.parse(docSnapshot.data()?.CARDSArr));
                setIsLoading(false);
            } catch (e) {
                console.error("Error fetching CARDS", e);
            }
        };

        fetchCARDSArr();
    }, [id]);

    return (
        <>
            {isLoading ? (
                <p>LOADING...</p>
            ) : (
                <CARDSContext.Provider
                    value={{ CARDSArr, CARDSIndex, setCARDSIndex }}
                >
                    <InputBody />
                </CARDSContext.Provider>
            )}
        </>
    );
}
