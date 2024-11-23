import React from "react";
import { CardCategory, CardRow, STATE } from "../../entity/types.ts";
import InputRow from "./InputRow.tsx";

interface Props {
    category: CardCategory;
    inputRefs: React.RefObject<HTMLInputElement>[];
    rowStates: STATE[];
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
    handleKeyDown,
}: Props) {
    //

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
