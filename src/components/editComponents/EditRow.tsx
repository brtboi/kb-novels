import React, { useState } from "react";
import classNames from "classnames";
import styles from "./editStyles.module.css";
import { CardRow } from "../../entity/types";
import EditAddButton from "./EditAddButton";

interface RowProps {
    row: CardRow;
    updateRow: (updatedRow: CardRow) => void;
    addRow: () => void;
    isTemplate: boolean;
}

export default function Row({ row, updateRow, addRow, isTemplate }: RowProps) {
    //
    const [label, setLabel] = useState<string>(row.label);
    const [answer, setAnswer] = useState<string>(row.answer);

    const handleLabelOnBlur = () => {
        updateRow({ ...row, label: label });
    };

    const handleAnswerOnBlur = () => {
        updateRow({ ...row, answer: answer });
    };

    const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newLabel = e.target.value;
        setLabel(newLabel);
    };

    const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newAnswer = e.target.value;
        setAnswer(newAnswer);
    };

    return (
        <div>
            <div>
                <input
                    className={classNames(styles.Input)}
                    type="text"
                    value={label}
                    onChange={handleLabelChange}
                    onBlur={handleLabelOnBlur}
                />
                {!isTemplate && (
                    <input
                        className={classNames(styles.Input)}
                        type="text"
                        value={answer}
                        onChange={handleAnswerChange}
                        onBlur={handleAnswerOnBlur}
                    />
                )}
            </div>
            <EditAddButton onClick={addRow}>Add Row</EditAddButton>
        </div>
    );
}
