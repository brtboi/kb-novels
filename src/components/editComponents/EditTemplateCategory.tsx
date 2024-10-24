import classNames from "classnames";
import styles from "./editStyles.module.css";
import { useContext, useState } from "react";
import { EditContext } from "../../entity/contexts";
import { CardCategory, ROWTYPE, TemplateCategory } from "../../entity/types";

interface Props {
    index: number;
}

export default function EditTemplateCategory({ index }: Props) {
    const { templateRef } = useContext(EditContext)!;
    const [category, setCategory] = useState<CardCategory>(
        templateRef.current!.categories[index]
    );

    const handleCategoryNameChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = event.target.value;

        setCategory((prev) => {
            const updatedCategory = { ...prev, name: value };
            templateRef.current!.categories[index] = updatedCategory;
            return updatedCategory;
        });
    };

    const handleAddRow = () => {
        setCategory((prev) => {
            const newRow = {
                label: `Row_${prev.rows.length}`,
                answer: "",
                _type: ROWTYPE.STRING,
                _isCaseSensitive: false,
            };

            const updatedCategory = {
                ...prev,
                rows: [...prev.rows, newRow],
            };
            templateRef.current!.categories[index] = updatedCategory;
            return updatedCategory;
        });

        console.log("cardReal:", templateRef.current!.categories[index])
        console.log("cardState", category)
    };

    const handleRowChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        rowIndex: number
    ) => {
        const value = event.target.value;

        setCategory((prev) => {
            const updatedRow = { ...prev.rows[rowIndex], label: value };
            const updatedCategory = {
                ...prev,
                rows: prev.rows.map((row, i) =>
                    i === rowIndex ? updatedRow : row
                ),
            };

            templateRef.current!.categories[index] = updatedCategory;
            return updatedCategory;
        });
    };

    return (
        <div className={classNames(styles.CardCategory)}>
            <input
                className={classNames(styles.Input)}
                type="text"
                value={category.name}
                autoComplete="off"
                spellCheck="false"
                onChange={handleCategoryNameChange}
            />
            {category.rows.map((_, rowIndex) => (
                <>
                    <input
                        className={classNames(styles.Input)}
                        type="text"
                        value={category.rows[rowIndex].label}
                        autoComplete="off"
                        spellCheck="false"
                        onChange={(e) => {
                            handleRowChange(e, rowIndex);
                        }}
                        key={`Cat ${category.name} row ${rowIndex}`}
                    />
                    <p key={"hello world row" + category.name + rowIndex}>{category.rows[rowIndex].answer || "none"}</p>
                </>
            ))}

            <button onClick={handleAddRow}>Add Row</button>
        </div>
    );
}
