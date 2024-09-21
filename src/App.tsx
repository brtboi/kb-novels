import { useState, useEffect, useCallback } from "react";
import "./global.css";
import { CARDSContext } from "./entity/contexts.ts";
import { Card } from "./entity/types.ts";
import InputBody from "./components/inputComponents/InputBody.tsx";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase/firebase.ts";

export default function App() {
    const [CARDSArr, setCARDSArr] = useState<Card[]>([]);
    const [CARDSIndex, setCARDSIndex] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchCARDSArr = async () => {
            try {
                const docSnap = await getDoc(
                    doc(db, "sets/6GoiEejJKiekdOlYxCHP")
                );
                setCARDSArr(docSnap.data()?.CARDSArr);
                setIsLoading(false);
            } catch (e) {
                console.error("Error fetching CARDS", e);
            }
        };

        fetchCARDSArr();
    }, []);

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
