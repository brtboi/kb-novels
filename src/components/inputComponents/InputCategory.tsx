import React from "react";
import { CardCategory, CardRow } from "../../entity/types.ts";
import InputRow from "./InputRow.tsx";

interface Props {
    category: CardCategory;
    addInputRef: (ref: React.RefObject<HTMLInputElement>) => number;
    focusNextInput: (index: number, step: -1 | 1) => void;
}

export default function InputCategory({
    category,
    addInputRef,
    focusNextInput,
}: Props) {
    return (
        <>
            {category.rows.map((row, rowIndex) => {
                return (
                    <InputRow
                        row={row}
                        addInputRef={addInputRef}
                        focusNextInput={focusNextInput}
                    />
                );
            })}
        </>
    );
}
