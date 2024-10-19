import React, { useRef, useState } from "react";
import { Card, InputNodeList } from "../../entity/types.ts";
import { InputContext } from "../../entity/contexts.ts";
import InputCategory from "./InputCategory.tsx";

interface Props {
    CARDSArr: Card[];
}

export default function InputBody({ CARDSArr }: Props) {
    const [CARDSIndex, setCARDSIndex] = useState<number>(0);

    const currentCard: Card = CARDSArr[CARDSIndex];

    const getNextCard = () => {
        setCARDSIndex((prev) => prev + 1);
    };

    const inputNodeListRef = useRef<InputNodeList>(new InputNodeList(getNextCard));

    return (
        <>
            <InputContext.Provider value={{ inputNodeListRef }}>
                {Object.entries(currentCard).map(([category, rows], index) => (
                    <InputCategory
                        category={category}
                        rows={rows}
                        key={`Input Category ${index}`}
                    />
                ))}
            </InputContext.Provider>
        </>
    );
}
