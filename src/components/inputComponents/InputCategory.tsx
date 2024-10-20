import React from "react";
import { CardRows } from "../../entity/types.ts";
import InputRow from "./InputRow.tsx";

interface Props {
    category: string;
    rows: CardRows;
}

export default function InputCategory({ category, rows }: Props) {

    return (
        <>
            {Object.entries(rows).map(([label, answer], index) => {
                return (
                    <InputRow
                        category={category}
                        label={label}
                        answer={answer}
                        key={`Input Row ${label} ${answer} ${index}`}
                    />
                );
            })}
        </>
    );
}
