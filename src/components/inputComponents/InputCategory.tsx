import React, { useEffect } from "react";
import { CardCategory, CardRow, STATE } from "../../entity/types.ts";
import InputRow from "./InputRow.tsx";

interface Props {
    category: CardCategory;
    inputRefs: React.RefObject<HTMLInputElement>[];
    rowStates: STATE[];
    startIndex: number;
    updateCategoryStates: (newState: boolean) => void;
    handleKeyDown: (
        inputIndex: number,
        event: React.KeyboardEvent<HTMLInputElement>,
        row: CardRow
    ) => void;
}

export default function InputCategory({
    category,
    inputRefs,
    rowStates,
    startIndex,
    updateCategoryStates,
    handleKeyDown,
}: Props) {
    useEffect(() => {
        if (
            rowStates
                .slice(startIndex, startIndex + category.rows.length)
                .every((state) => state !== STATE.ASK)
        ) {
            updateCategoryStates(true);
        }
    }, [rowStates]);

    return (
        <>
            {category.rows.map((row, rowIndex) => {
                return (
                    <InputRow
                        row={row}
                        state={rowStates[rowIndex]}
                        handleKeyDown={(e) => {
                            handleKeyDown(startIndex + rowIndex, e, row);
                        }}
                        ref={inputRefs[rowIndex]}
                        key={`row ${startIndex + rowIndex}`}
                    />
                );
            })}
        </>
    );
}
