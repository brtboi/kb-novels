import React, { MutableRefObject, useRef, useState } from "react";
import classNames from "classnames";
import styles from "./inputStyles.module.css";

interface Props {
    category: string;
    label: string;
    answer: string[] | number[];
    inputRowRefs: MutableRefObject<Set<HTMLDivElement>>;
}

export default function InputRow({
    category,
    label,
    answer,
    inputRowRefs,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isInputCorrect, setIsInputCorrect] = useState<boolean>(false);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const value = event.currentTarget.value;

        if (event.key === "Enter") {
            if (
                answer.some(
                    (e) =>
                        e.toString().toLocaleUpperCase() ===
                        value.toLocaleUpperCase()
                )
            ) {
                setIsInputCorrect(true);
            } else {
                setIsInputCorrect(false);
                event.currentTarget.select();
            }
        }
    };

    return (
        <div
            className={styles.InputRow}
            data-category={category}
            data-input-ref={inputRef.current}
            ref={(el) => {
                if (el) inputRowRefs.current.add(el);
            }}
        >
            <label className={styles.Label}>{`${label}:`}</label>
            <input
                className={classNames(styles.Input, {
                    [styles.correct]: isInputCorrect,
                })}
                type="text"
                autoComplete="off"
                spellCheck="false"
                onKeyDown={handleKeyDown}
                ref={inputRef}
            />
            <p className={styles.Answer}>{answer}</p>
        </div>
    );
}
