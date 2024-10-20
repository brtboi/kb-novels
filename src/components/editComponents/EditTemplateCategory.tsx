import classNames from "classnames";
import styles from "./editStyles.module.css";
import { useContext, useState } from "react";
import { EditContext } from "../../entity/contexts";
import { ROWTYPE, TemplateCategory } from "../../entity/types";

interface Props {
    index: number;
}

export default function EditTemplateCategory({ index }: Props) {
    const { templateRef } = useContext(EditContext)!;
    const [category, setCategory] = useState<TemplateCategory>(
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
        <div className={classNames(styles.TemplateCategory)}>
            <input
                type="text"
                value={category.name}
                autoComplete="off"
                spellCheck="false"
                onChange={handleCategoryNameChange}
            />
            <p>{category.name}</p>
            <p>dependencies: {category._dependencies}</p>
            <p>isOrdered: {category._isOrdered.toString()}</p>
            <p>rows:</p>
            {category.rows.map(({ label, _type, _isCaseSensitive }, rowIndex) => (
                <input
                    type="text"
                    value={category.rows[rowIndex].label}
                    autoComplete="off"
                    spellCheck="false"
                    onChange={(e) => {handleRowChange(e, rowIndex)}}
                />
            ))}

            <button onClick={handleAddRow}>Add Row</button>
        </div>
    );
}
