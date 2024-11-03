import React, { useRef, useState } from "react";
import { Card, InputNodeList } from "../../entity/types.ts";
import { InputContext } from "../../entity/contexts.ts";
import InputCategory from "./InputCategory.tsx";

interface Props {
    cards: Card[];
}

export default function InputBody({ cards }: Props) {
    const [CARDSIndex, setCARDSIndex] = useState<number>(0);

    const currentCard: Card = cards[CARDSIndex];

    const getNextCard = () => {
        setCARDSIndex((prev) => prev + 1);
    };

    const inputNodeListRef = useRef<InputNodeList>(
        new InputNodeList(getNextCard)
    );

    return (
        <>
            <InputContext.Provider value={{ inputNodeListRef }}>
                
            </InputContext.Provider>
        </>
    );
}
