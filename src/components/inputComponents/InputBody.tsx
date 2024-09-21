import { useContext, useRef } from "react";
import { Card } from "../../entity/types.ts";
import { CARDSContext } from "../../entity/contexts.ts";
import InputCategory from "./InputCategory.tsx";

export default function InputBody() {
    const { CARDSArr, CARDSIndex, setCARDSIndex } = useContext(CARDSContext);
    const currentCard: Card = CARDSArr[CARDSIndex];

    const inputRowRefs = useRef<Set<HTMLDivElement>>(new Set());

    return (
        <>
            {Object.entries(currentCard).map(([category, rows]) => (
                <InputCategory
                    category={category}
                    rows={rows}
                    inputRowRefs={inputRowRefs}
                />
            ))}
        </>
    );
}
