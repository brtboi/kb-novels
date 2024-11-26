import React, { useState } from "react";
import { Card, CardCategory } from "../../entity/types";
import EditCategory from "./EditCategory";
import { ReactComponent as DeleteIcon } from "../../assets/Icons/Delete.svg";
import { ReactComponent as DropDownIcon } from "../../assets/Icons/DropDown.svg";
import { ReactComponent as ReorderIcon } from "../../assets/Icons/Reorder.svg";
import styles from "./editStyles.module.css";
import classNames from "classnames";
import { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";

type Props =
    | {
          card: Card;
          cardIndex: number;
          updateCard: (newCard: Card) => void;
          deleteCard?: never;
          isTemplate: true;
          dragHandleProps?: never;
      }
    | {
          card: Card;
          cardIndex: number;
          updateCard: (newCard: Card) => void;
          deleteCard: () => void;
          isTemplate: false;
          dragHandleProps: DraggableProvidedDragHandleProps | null;
      };

export default function EditCard({
    card,
    cardIndex,
    updateCard,
    deleteCard,
    isTemplate,
    dragHandleProps,
}: Props) {
    //
    const [isCondensed, setIsCondensed] = useState<boolean>(false);

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
            <div className={classNames(styles.Card)}>
                <div className={classNames(styles.CardSidePanel)}>
                    {isTemplate ? (
                        <div />
                    ) : (
                        <button
                            {...dragHandleProps}
                            className={classNames(styles.SettingsButton)}
                        >
                            <ReorderIcon className={classNames(styles.Icon)} />
                        </button>
                    )}
                    <button
                        onClick={() => {
                            setIsCondensed((prev) => !prev);
                        }}
                        className={classNames(styles.SettingsButton, {
                            [styles.toggleOn]: isCondensed,
                        })}
                    >
                        <DropDownIcon className={classNames(styles.Icon)} />
                    </button>
                </div>
                {isCondensed ? (
                    <div>
                        {isTemplate ? (
                            <p>Template</p>
                        ) : (
                            <p style={{ display: "flex" }}>
                                {`Card ${cardIndex} | `}
                                <button
                                    onClick={deleteCard}
                                    className={classNames(
                                        styles.SettingsButton
                                    )}
                                >
                                    <DeleteIcon
                                        className={classNames(styles.Icon)}
                                    />
                                </button>

                                {` | ${card.categories[0].rows[0].label}: ${card.categories[0].rows[0].answers[0]}`}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className={classNames(styles.CardCategoriesDiv)}>
                        {isTemplate ? (
                            <p>Template:</p>
                        ) : (
                            <p style={{ display: "flex" }}>
                                {`Card ${cardIndex}`} |
                                <button
                                    onClick={deleteCard}
                                    className={classNames(
                                        styles.SettingsButton
                                    )}
                                >
                                    <DeleteIcon
                                        className={classNames(styles.Icon)}
                                    />
                                </button>
                            </p>
                        )}
                        {card.categories.map((category, categoryIndex) => {
                            return (
                                <EditCategory
                                    category={category}
                                    updateCategory={(newCategory) => {
                                        handleUpdateCategory(
                                            categoryIndex,
                                            newCategory
                                        );
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
                        <button onClick={handleAddCategory}>
                            add category
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
