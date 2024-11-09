import React, { useState } from "react";
import classNames from "classnames";
import styles from "./editStyles.module.css";
import { CardCategory, CardRow, ROWTYPE } from "../../entity/types";
import EditRow from "./EditRow";
import EditAddButton from "./EditAddButton";

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
    //
    const [categoryName, setCategoryName] = useState<string>(category.name);

    const handleCategoryNameOnBlur = () => {
        updateCategory({ ...category, name: categoryName });
    };

    const handleUpdateCategoryName = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newName = e.target.value;
        setCategoryName(newName);
    };

    const addRow = (index: number) => {
        const newRow: CardRow = {
            label: `Row_${category.rows.length}`,
            answer: "",
            _type: ROWTYPE.STRING,
            _isCaseSensitive: false,
        };

        const updatedRows = structuredClone(category.rows)
        updatedRows.splice(index, 0, newRow);

        updateCategory({ ...category, rows: updatedRows });
    };

    const updateRow = (rowIndex: number, newRow: CardRow) => {
        const updatedRows = structuredClone(category.rows);
        updatedRows[rowIndex] = newRow;
        updateCategory({ ...category, rows: updatedRows });
    };

    return (
        <div className={classNames(styles.CardCategory)}>
            <input
                className={classNames(styles.CategoryName, styles.Input)}
                type="text"
                value={categoryName}
                onChange={handleUpdateCategoryName}
                onBlur={handleCategoryNameOnBlur}
                style={{ width: `${Math.max(categoryName.length + 2, 1)}ch` }}
            />
            <EditAddButton onClick={() => {addRow(0)}}>Add Row</EditAddButton>
            {category.rows.map((row, rowIndex) => (
                <EditRow
                    row={row}
                    updateRow={(newRow) => {
                        updateRow(rowIndex, newRow);
                    }}
                    addRow={() => {addRow(rowIndex + 1)}}
                    isTemplate={isTemplate}
                    key={`${category.name} | ${rowIndex} | ${row.label}`}
                />
            ))}
        </div>
    );
}
