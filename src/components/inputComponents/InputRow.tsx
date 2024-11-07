import React from "react";
import classNames from "classnames";
import styles from "./inputStyles.module.css";
import { CardRow, STATE } from "../../entity/types";

interface Props {
    row: CardRow;
    state: STATE;
    handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default React.forwardRef<HTMLInputElement, Props>(
    ({ row, state, handleKeyDown }, ref) => {
        // const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        //     const value = event.currentTarget.value;

        //     switch (event.key) {
        //         case "Enter":
        //             if (value === "") {
        //                 thisInputNode!.step(1);
        //             } else if (
        //                 answer.some(
        //                     (e: string | number) =>
        //                         e.toString().toLocaleUpperCase() ===
        //                         value.toLocaleUpperCase()
        //                 )
        //             ) {
        //                 thisInputNode!.state = STATE.CORRECT;
        //                 thisInputNode!.step(1);
        //             } else if (value === "idk") {
        //                 thisInputNode!.state = STATE.INCORRECT;
        //                 thisInputNode!.step(1);
        //             } else {
        //                 event.currentTarget.select();
        //             }
        //             break;

        //         case "ArrowUp":
        //             thisInputNode!.step(-1);
        //             break;

        //         case "ArrowDown":
        //             thisInputNode!.step(1);
        //             break;
        //     }
        // };

        return (
            <div className={styles.InputRow}>
                <label className={styles.Label}>{`${row.label}:`}</label>
                <input
                    className={classNames(styles.Input, {
                        [styles.correct]: state === STATE.CORRECT,
                        [styles.incorrect]: state === STATE.INCORRECT,
                        [styles.shake]: state === STATE.INCORRECT,
                    })}
                    type="text"
                    autoComplete="off"
                    spellCheck="false"
                    onKeyDown={handleKeyDown}
                    ref={ref}
                />
                <p className={styles.Answer}>{row.answer}</p>
            </div>
        );
    }
);
