import React, { useEffect, useState } from "react";
import classNames from "classnames";
import styles from "./editStyles.module.css";
import { CardRow } from "../../entity/types";
import { ReactComponent as AddIcon } from "../../assets/Icons/Add.svg";
import { ReactComponent as DeleteIcon } from "../../assets/Icons/Delete.svg";

interface RowProps {
    row: CardRow;
    updateRow: (updatedRow: CardRow) => void;
    isTemplate: boolean;
}

export default function Row({ row, updateRow, isTemplate }: RowProps) {
    //
    const [label, setLabel] = useState<string>(row.label);
    const [answers, setAnswers] = useState<string[]>(row.answers);

    useEffect(() => {
        setAnswers(row.answers);
    }, [row]);

    const handleLabelOnBlur = () => {
        updateRow({ ...row, label: label });
    };

    const handleAnswerOnBlur = () => {
        updateRow({ ...row, answers: answers });
    };

    const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newLabel = e.target.value;
        setLabel(newLabel);
    };

    const handleAnswerChange = (
        answerIndex: number,
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setAnswers((prev) => {
            const updatedAnswers = structuredClone(prev);
            updatedAnswers[answerIndex] = e.target.value;
            return updatedAnswers;
        });
    };

    const addAnswer = () => {
        updateRow({ ...structuredClone(row), answers: [...row.answers, ""] });
    };

    const deleteAnswer = (answerIndex: number) => {
        const updatedAnswers = [...row.answers];
        updatedAnswers.splice(answerIndex, 1);
        updateRow({ ...structuredClone(row), answers: updatedAnswers });
    };

    return (
        <div className={classNames(styles.CardRow)}>
            <div className={classNames(styles.LabelDiv)}>
                <input
                    className={classNames(styles.Input, styles.Label)}
                    type="text"
                    value={label}
                    onChange={handleLabelChange}
                    onBlur={handleLabelOnBlur}
                    spellCheck={false}
                />
                <p className={classNames(styles.LabelColon)}>:</p>
            </div>

            {!isTemplate && (
                <>
                    <div className={classNames(styles.AnswerDiv)}>
                        {row.answers.map((answer, answerIndex) => (
                            <div
                                className={classNames(styles.AnswerRow)}
                                key={`${row.label + answer + answerIndex}`}
                            >
                                <input
                                    className={classNames(
                                        styles.Input,
                                        styles.Answer
                                    )}
                                    type="text"
                                    value={answers[answerIndex] ?? ""}
                                    onChange={(e) => {
                                        handleAnswerChange(answerIndex, e);
                                    }}
                                    onBlur={handleAnswerOnBlur}
                                    spellCheck={false}
                                />
                                {answerIndex === 0 ? (
                                    <button
                                        onClick={addAnswer}
                                        className={classNames(styles.AddButton)}
                                    >
                                        <AddIcon
                                            className={classNames(styles.Icon)}
                                        />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            deleteAnswer(answerIndex);
                                        }}
                                        className={classNames(
                                            styles.SettingsButton
                                        )}
                                    >
                                        <DeleteIcon
                                            className={classNames(styles.Icon)}
                                        />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
