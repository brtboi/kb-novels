import React, { useContext, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import styles from "./inputStyles.module.css";
import { InputContext } from "../../entity/contexts";
import { InputNode, STATES } from "../../entity/types";

interface Props {
    category: string;
    label: string;
    answer: string[] | number[];
}

export default function InputRow({ category, label, answer }: Props) {
    const { inputNodeListRef } = useContext(InputContext)!;
    const isFirstMount = useRef<boolean>(true);

    const inputRef = useRef<HTMLInputElement>(null);
    const [thisInputNode, setThisInputNode] = useState<InputNode | null>(null);
    const [isInputCorrect, setIsInputCorrect] = useState<boolean>(false);

    useEffect(() => {
        if (isFirstMount) {
            const inputNodeTemp = new InputNode(inputRef, STATES.ASK);
            setThisInputNode(inputNodeTemp);
            inputNodeListRef.current.add(inputNodeTemp);
        }

        isFirstMount.current = false;
    }, []);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const value = event.currentTarget.value;

        if (event.key === "Enter") {
            if (
                answer.some(
                    (e: string | number) =>
                        e.toString().toLocaleUpperCase() ===
                        value.toLocaleUpperCase()
                )
            ) {
                setIsInputCorrect(true);
                thisInputNode?.step(1);
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
