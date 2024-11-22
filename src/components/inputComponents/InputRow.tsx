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
        return (
            <div className={styles.InputRow}>
                <label className={styles.Label}>{`${row.label}:`}</label>
                {state === STATE.ASK && (
                    <input
                        className={classNames(styles.Input)}
                        type="text"
                        autoComplete="off"
                        spellCheck="false"
                        onKeyDown={handleKeyDown}
                        ref={ref}
                    />
                )}
                {(state === STATE.SHOW ||
                    state === STATE.CORRECT ||
                    state === STATE.INCORRECT) && (
                    <p
                        className={classNames(styles.Answer, {
                            [styles.correct]: state === STATE.CORRECT,
                            [styles.incorrect]: state === STATE.INCORRECT,
                            [styles.shake]: state === STATE.INCORRECT,
                        })}
                    >
                        {row.answers.join(" | ")}
                    </p>
                )}
            </div>
        );
    }
);
