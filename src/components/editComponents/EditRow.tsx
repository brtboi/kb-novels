import classNames from "classnames";
import styles from "./editStyles.module.css";
import { CardRow } from "../../entity/types";

interface RowProps {
    row: CardRow;
    updateRow: (updatedRow: CardRow) => void;
    isTemplate: boolean;
}

export default function Row({ row, updateRow, isTemplate }: RowProps) {
    //
    const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newLabel = e.target.value;
        updateRow({ ...row, label: newLabel });
    };

    const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newAnswer = e.target.value;
        updateRow({ ...row, answer: newAnswer });
    };

    return (
        <div>
            <input
                className={classNames(styles.Input)}
                type="text"
                value={row.label}
                onChange={handleLabelChange}
            />
            {!isTemplate && (
                <input
                    className={classNames(styles.Input)}
                    type="text"
                    value={row.answer}
                    onChange={handleAnswerChange}
                />
            )}
        </div>
    );
}
