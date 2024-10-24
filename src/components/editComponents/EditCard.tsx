import { useContext, useState } from "react";
import classNames from "classnames";
import styles from "./editStyles.module.css";
import { Card, CardCategory } from "../../entity/types";
import EditCategory from "./EditCategory";
import { EditContext } from "../../entity/contexts";

interface Props {
    card: Card;
    updateCard: (newCard: Card) => void;
    isTemplate: boolean;
}

export default function EditCard({ card, updateCard, isTemplate }: Props) {
    
    const handleAddCategory = () => {
        const blankCategory = {
            _dependencies: [],
            _isOrdered: false,
            _isSequential: false,
            name: `Category_${card.categories.length}`,
            rows: [],
        };
        const newCard: Card = {
            ...card,
            categories: [...card.categories, blankCategory],
        };

        updateCard(newCard);
    };

    const handleUpdateCategory = (
        categoryIndex: number,
        newCategory: CardCategory
    ) => {
        const newCategories = [...card.categories];
        newCategories[categoryIndex] = newCategory;

        updateCard({ ...card, categories: newCategories });
    };

    return (
        <>
            {card.categories.map((category, categoryIndex) => {
                return (
                    <EditCategory
                        category={category}
                        updateCategory={(newCategory) => {
                            handleUpdateCategory(categoryIndex, newCategory);
                        }}
                        isTemplate={isTemplate}
                        key={`category ${category.name}`}
                    />
                );
            })}
            <button onClick={handleAddCategory}>add category</button>
        </>
    );
}
