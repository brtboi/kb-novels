import { useContext, useState } from "react";
import { EditContext } from "../../entity/contexts";
import { CardCategory, CardRow } from "../../entity/types";
import classNames from "classnames";
import styles from "./editStyles.module.css";

interface Props {
    category: CardCategory;
    rowIndex: number;
}

export default function EditCardsRow({ category, rowIndex }: Props) {
    const [row, setRow] = useState<CardRow>(category.rows[rowIndex]);



    const handleRowInputChange = (
        event: React.ChangeEvent<HTMLInputElement>, attribute: "label" | "answer"
    ) => {
        const value = event.target.value;

        setRow((prev) => {
            const updatedRow = { ...prev, [`${attribute}`]: value };
            category.rows[rowIndex] = updatedRow;
            return updatedRow;
        });
    };

    return (
        <div>
            <input
                className={classNames(styles.Input)}
                type="text"
                value={row.label}
                autoComplete="off"
                spellCheck="false"
                onChange={(e) => {handleRowInputChange(e, "label")}}
            />
            <p>:</p>
            <input
                className={classNames(styles.Input)}
                type="text"
                value={row.answer}
                autoComplete="off"
                spellCheck="false"
                onChange={(e) => {handleRowInputChange(e, "answer")}}
            />
        </div>
    );
}
