import React, { ReactNode } from "react";
import styles from "./editStyles.module.css";
import classNames from "classnames";

interface Props {
    onClick: () => void;
    children: ReactNode;
}

export default function EditAddButton({ onClick, children }: Props) {
    return (
        <div className={classNames(styles.AddButtonDiv)}>
            <button
                onClick={() => {
                    onClick();
                }}
                className={classNames(styles.AddButton)}
            >
                {children}
            </button>
        </div>
    );
}
