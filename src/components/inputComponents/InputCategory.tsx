import React, { useEffect } from "react";
import { CardCategory, CardRow, STATE } from "../../entity/types.ts";
import InputRow from "./InputRow.tsx";

interface Props {
    category: CardCategory;
    inputRefs: React.RefObject<HTMLInputElement>[];
    rowStates: STATE[];
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
    updateCategoryStates,
    handleKeyDown,
}: Props) {
    //
    useEffect(() => {
        if (rowStates.length > 0 && rowStates.every((state) => state !== STATE.ASK)) {
            updateCategoryStates(true);
        } else {
            updateCategoryStates(false);
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
                            handleKeyDown(rowIndex, e, row);
                        }}
                        ref={inputRefs[rowIndex]}
                        key={`${category._ID} row ${rowIndex}`}
                    />
                );
            })}
        </>
    );
}
