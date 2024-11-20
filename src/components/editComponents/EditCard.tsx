import React from "react";
import { Card, CardCategory } from "../../entity/types";
import EditCategory from "./EditCategory";
import { ReactComponent as DeleteIcon } from "../../assets/Icons/Delete.svg";
import styles from "./editStyles.module.css";
import classNames from "classnames";

type Props =
    | {
          card: Card;
          cardIndex: number;
          updateCard: (newCard: Card) => void;
          deleteCard?: never;
          isTemplate: true;
      }
    | {
          card: Card;
          cardIndex: number;
          updateCard: (newCard: Card) => void;
          deleteCard: () => void;
          isTemplate: false;
      };

export default function EditCard({
    card,
    cardIndex,
    updateCard,
    deleteCard,
    isTemplate,
}: Props) {
    //
    const categoryDict: Record<string, string> = Object.fromEntries(
        card.categories.map((category) => [category._ID, category.name])
    );

    const handleAddCategory = () => {
        const blankCategory = {
            _dependencies: [],
            _isShuffled: false,
            _isSequential: false,
            _ID: `${new Date().toISOString()}-${Math.random()}`,
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
        const updatedCategories = [...card.categories];
        updatedCategories[categoryIndex] = newCategory;

        updateCard({ ...card, categories: updatedCategories });
    };

    const deleteCategory = (categoryIndex: number) => {
        const updatedCategories = [...card.categories];
        updatedCategories.splice(categoryIndex, 1);

        updateCard({ ...card, categories: updatedCategories });
    };

    return (
        <>
            {!isTemplate && (
                <p style={{display: "flex"}}>
                    {`Card ${cardIndex}`} |{" "}
                    <button
                        onClick={deleteCard}
                        className={classNames(styles.SettingsButton)}
                    >
                        <DeleteIcon className={classNames(styles.Icon)} />
                    </button>
                </p>
            )}
            {card.categories.map((category, categoryIndex) => {
                return (
                    <EditCategory
                        category={category}
                        updateCategory={(newCategory) => {
                            handleUpdateCategory(categoryIndex, newCategory);
                        }}
                        deleteCategory={() => {
                            deleteCategory(categoryIndex);
                        }}
                        isTemplate={isTemplate}
                        categoryDict={categoryDict}
                        key={`category ${category.name} | ${categoryIndex}`}
                    />
                );
            })}
            <button onClick={handleAddCategory}>add category</button>
        </>
    );
}
