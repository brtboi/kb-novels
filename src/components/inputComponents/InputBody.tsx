import React, { useContext, useRef } from "react";
import { Card, InputNodeList } from "../../entity/types.ts";
import { CARDSContext, InputContext } from "../../entity/contexts.ts";
import InputCategory from "./InputCategory.tsx";

export default function InputBody() {
    const { CARDSArr, CARDSIndex } = useContext(CARDSContext)!;
    const currentCard: Card = CARDSArr[CARDSIndex];

    const inputNodeListRef = useRef<InputNodeList>(new InputNodeList());

    return (
        <>
            <InputContext.Provider
                value={{
                    inputNodeListRef,
                }}
            >
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
