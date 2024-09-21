import React, { useContext, useRef } from "react";
import { Card } from "../../entity/types.ts";
import { CARDSContext } from "../../entity/contexts.ts";
import InputCategory from "./InputCategory.tsx";

export default function InputBody() {
    const { CARDSArr, CARDSIndex } = useContext(CARDSContext);
    const currentCard: Card = CARDSArr[CARDSIndex];

    const inputRowRefs = useRef<Set<HTMLDivElement>>(new Set());

    return (
        <>
            {Object.entries(currentCard).map(([category, rows], index) => (
                <InputCategory
                    category={category}
                    rows={rows}
                    inputRowRefs={inputRowRefs}
                    key={`Input Category ${index}`}
                />
            ))}
        </>
    );
}
