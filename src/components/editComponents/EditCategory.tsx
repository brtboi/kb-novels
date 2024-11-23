import React from "react";
import classNames from "classnames";
import styles from "./editStyles.module.css";
import { CardCategory, CardRow } from "../../entity/types";
import EditRow from "./EditRow";
import EditCategoryHeader from "./EditCategoryHeader";

interface Props {
    category: CardCategory;
    updateCategory: (updatedCategory: CardCategory) => void;
    deleteCategory: () => void;
    isTemplate: boolean;
    categoryDict: Record<string, string>;
}

export default function EditCategory({
    category,
    updateCategory,
    deleteCategory,
    isTemplate,
    categoryDict,
}: Props) {
    //
    const updateRow = (rowIndex: number, newRow: CardRow) => {
        const updatedRows = structuredClone(category.rows);
        updatedRows[rowIndex] = newRow;
        updateCategory({ ...category, rows: updatedRows });
    };

    return (
        <div className={classNames(styles.CardCategory)}>
            <EditCategoryHeader
                category={category}
                updateCategory={updateCategory}
                deleteCategory={deleteCategory}
                categoryDict={categoryDict}
            />
            {category.rows.map((row, rowIndex) => (
                <EditRow
                    row={row}
                    updateRow={(newRow) => {
                        updateRow(rowIndex, newRow);
                    }}
                    isTemplate={isTemplate}
                    key={`${category.name} | ${rowIndex} | ${row.label}`}
                />
            ))}
        </div>
    );
}
