import React, { useEffect, useState } from "react";
import classNames from "classnames";
import styles from "./editStyles.module.css";
import { CardRow, RowType } from "../../entity/types";
import { ReactComponent as AddIcon } from "../../assets/Icons/Add.svg";
import { ReactComponent as DeleteIcon } from "../../assets/Icons/Delete.svg";
import { ReactComponent as CaseSensitiveIcon } from "../../assets/Icons/Aa.svg";
import { ReactComponent as TextIcon } from "../../assets/Icons/Text.svg";
import { ReactComponent as NumberIcon } from "../../assets/Icons/Number.svg";
import { ReactComponent as NameIcon } from "../../assets/Icons/Person.svg";

interface RowProps {
    row: CardRow;
    updateRow: (updatedRow: CardRow) => void;
    isTemplate: boolean;
}

const getRowTypesArr = (rowType: RowType) => {
    const rowTypesArr: RowType[] = ["text", "name", "number"];
    const index = rowTypesArr.indexOf(rowType);
    return [
        ...rowTypesArr.slice(index + 1),
        ...rowTypesArr.slice(0, index + 1),
    ];
};

const IconByType: Record<RowType, JSX.Element> = {
    text: <TextIcon className={styles.Icon} />,
    name: <NameIcon className={styles.Icon} />,
    number: <NumberIcon className={styles.Icon} />,
};

export default function Row({ row, updateRow, isTemplate }: RowProps) {
    //
    const [label, setLabel] = useState<string>(row.label);
    const [answers, setAnswers] = useState<string[]>(row.answers);

    const rowTypesArr = getRowTypesArr(row._type);
    const [rowType, setRowType] = useState<RowType>(row._type);
    const [isRowTypesOpen, setIsRowTypesOpen] = useState<boolean>(false);

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

    const updateRowType = (newRowType: RowType) => {
        setTimeout(() => {
            updateRow({ ...structuredClone(row), _type: newRowType });
        }, 500);
    };

    const toggleIsCaseSensitive = () => {
        updateRow({
            ...structuredClone(row),
            _isCaseSensitive: !row._isCaseSensitive,
        });
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

            <div
                className={classNames(styles.RowSettingsDiv, {
                    [styles.expanded]: isRowTypesOpen,
                })}
                style={{
                    width: isRowTypesOpen ? "11.5rem" : "6.5rem",
                    transition: "width 0.5s ease",
                }}
            >
                <div
                    className={classNames(styles.RowTypeDiv)}
                    onMouseEnter={() => {
                        console.log("open div");
                        setIsRowTypesOpen(true);
                    }}
                    onMouseLeave={() => {
                        setIsRowTypesOpen(false);
                        updateRowType(rowType);
                    }}
                    style={{
                        width: isRowTypesOpen ? "7.5rem" : "1.5rem",
                        transition: "width 0.5s ease",
                    }}
                >
                    {rowTypesArr.map((_rowType, rowTypeIndex) => (
                        <button
                            onClick={() => {
                                setRowType(_rowType);
                            }}
                            className={classNames(styles.SettingsButton, {
                                [styles.toggleOn]: rowType === _rowType,
                            })}
                            style={{
                                position:
                                    _rowType === rowType
                                        ? "static"
                                        : "absolute",
                                transform: isRowTypesOpen
                                    ? `translateX(${
                                          -2.5 * (2 - rowTypeIndex)
                                      }rem)`
                                    : `translateX(0)`,
                                transition: "transform 0.5s ease",
                            }}
                            key={`${_rowType}`}
                        >
                            {IconByType[_rowType]}
                        </button>
                    ))}
                </div>
                <button
                    onClick={toggleIsCaseSensitive}
                    className={classNames(styles.SettingsButton, {
                        [styles.toggleOn]: row._isCaseSensitive,
                    })}
                >
                    <CaseSensitiveIcon className={classNames(styles.Icon)} />
                </button>
            </div>
        </div>
    );
}
