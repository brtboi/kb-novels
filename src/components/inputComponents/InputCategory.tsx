import React, { MutableRefObject } from "react";
import { CardRows, } from "../../entity/types.ts";
import InputRow from "./InputRow.tsx";

interface Props {
    category: string;
    rows: CardRows;
    inputRowRefs: MutableRefObject<Set<HTMLDivElement>>;
}

export default function InputCategory({ category, rows, inputRowRefs }: Props) {
    //const { CARDSArr, CARDSIndex, setCARDSIndex } = useContext(CARDSContext);

    return (
        <>
            {Object.entries(rows).map(([label, answer], index) => {
                return (
                    <InputRow
                        category={category}
                        label={label}
                        answer={answer}
                        inputRowRefs={inputRowRefs}
                        key={`Input Row ${label} ${answer} ${index}`}
                    />
                );
            })}
        </>
    );
}
