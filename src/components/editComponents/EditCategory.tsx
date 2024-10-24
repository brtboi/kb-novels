import { useState } from "react";
import classNames from "classnames";
import styles from "./editStyles.module.css";
import { CardCategory, CardRow, ROWTYPE } from "../../entity/types";
import EditRow from "./EditRow";

interface Props {
    category: CardCategory;
    updateCategory: (updatedCategory: CardCategory) => void;
    isTemplate: boolean;
}

export default function EditCategory({
    category,
    updateCategory,
    isTemplate,
}: Props) {
    const [categoryName, setCategoryName] = useState<string>(category.name);

    const handleCategoryNameOnBlur = () => {
        updateCategory({ ...category, name: categoryName });
    };

    const handleUpdateCategoryName = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newName = e.target.value;
        // updateCategory({ ...category, name: newName });
        setCategoryName(newName)
    };

    const handleAddRow = () => {
        const newRow: CardRow = {
            label: `Row_${category.rows.length}`,
            answer: "",
            _type: ROWTYPE.STRING,
            _isCaseSensitive: false,
        };
        updateCategory({ ...category, rows: [...category.rows, newRow] });
    };

    const handleUpdateRow = (rowIndex: number, newRow: CardRow) => {
        const updatedRows = [...category.rows];
        updatedRows[rowIndex] = newRow;
        updateCategory({ ...category, rows: updatedRows });
    };

    return (
        <div className={classNames(styles.CardCategory)}>
            <input
                className={classNames(styles.Input)}
                type="text"
                value={categoryName}
                onChange={handleUpdateCategoryName}
                onBlur={handleCategoryNameOnBlur}
            />
            {category.rows.map((row, rowIndex) => (
                <EditRow
                    row={row}
                    updateRow={(newRow) => {
                        handleUpdateRow(rowIndex, newRow);
                    }}
                    isTemplate={isTemplate}
                    key={rowIndex}
                />
            ))}
            <button onClick={handleAddRow}>Add Row</button>
        </div>
    );
}
