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

    const [state, setState] = useState<STATES>();

    useEffect(() => {
        if (isFirstMount.current) {
            const inputNodeTemp = new InputNode(
                inputRef,
                STATES.ASK,
                inputNodeListRef.current
            );

            inputNodeTemp.setOnStateChange(() => {
                setState(inputNodeTemp.state);
            });

            setThisInputNode(inputNodeTemp);

            inputNodeListRef.current.add(inputNodeTemp);
        }

        isFirstMount.current = false;
    }, [inputNodeListRef]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const value = event.currentTarget.value;

        switch (event.key) {
            case "Enter":
                if (value === "") {
                    thisInputNode!.step(1);
                } else if (
                    answer.some(
                        (e: string | number) =>
                            e.toString().toLocaleUpperCase() ===
                            value.toLocaleUpperCase()
                    )
                ) {
                    thisInputNode!.state = STATES.CORRECT;
                    thisInputNode!.step(1);
                } else if (
                    value === "idk"
                ) {
                    thisInputNode!.state = STATES.INCORRECT;
                    thisInputNode!.step(1);
                } else {
                    event.currentTarget.select();
                }
                break;

            case "ArrowUp":
                thisInputNode!.step(-1);
                break;

            case "ArrowDown":
                thisInputNode!.step(1);
                break;
        }
    };

    return (
        <div className={styles.InputRow} data-category={category}>
            <label className={styles.Label}>{`${label}:`}</label>
            <input
                className={classNames(styles.Input, {
                    [styles.correct]: state === STATES.CORRECT,
                    [styles.incorrect]: state === STATES.INCORRECT,
                    [styles.shake]: state === STATES.INCORRECT,
                })}
                type="text"
                autoComplete="off"
                spellCheck="false"
                onKeyDown={handleKeyDown}
                ref={inputRef}
            />
            <p className={styles.Answer}>{answer}</p>
            <button>{thisInputNode?.state}</button>
        </div>
    );
}
