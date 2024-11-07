import React from "react";
import { CardCategory, CardRow, STATE } from "../../entity/types.ts";
import InputRow from "./InputRow.tsx";

interface Props {
    category: CardCategory;
    inputRefs: React.RefObject<HTMLInputElement>[];
    rowStates: STATE[];
    startIndex: number;
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
    handleKeyDown,
}: Props) {
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
