import classNames from "classnames";
import styles from "./editStyles.module.css";
import { ReactComponent as DependenciesIcon } from "../../assets/Icons/Dependencies.svg";
import { ReactComponent as CheckBoxOff } from "../../assets/Icons/CheckBoxOff.svg";
import { ReactComponent as CheckBoxOn } from "../../assets/Icons/CheckBoxOn.svg";
import { ReactComponent as IsSequentialIcon } from "../../assets/Icons/123.svg";
import { ReactComponent as IsShuffledIcon } from "../../assets/Icons/Shuffle.svg";
import { ReactComponent as DeleteIcon } from "../../assets/Icons/Delete.svg";
import { CardCategory, CardRow, ROWTYPE } from "../../entity/types";
import { useCallback, useEffect, useState } from "react";

interface Props {
    category: CardCategory;
    updateCategory: (updatedCategory: CardCategory) => void;
    deleteCategory: () => void;
    categoryDict: Record<string, string>;
}

export default function EditCategoryHeader({
    category,
    updateCategory,
    deleteCategory,
    categoryDict,
}: Props) {
    //
    const [categoryName, setCategoryName] = useState<string>(category.name);

    const [isDependenciesDrawerOpen, setIsDependenciesDrawerOpen] =
        useState<boolean>(false);

    const handleCategoryNameOnBlur = () => {
        updateCategory({ ...category, name: categoryName });
    };

    const handleUpdateCategoryName = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newName = e.target.value;
        setCategoryName(newName);
    };

    const addRow = () => {
        const newRow: CardRow = {
            label: `Row_${category.rows.length}`,
            answers: [""],
            _type: ROWTYPE.STRING,
            _isCaseSensitive: false,
        };

        updateCategory({ ...category, rows: [...category.rows, newRow] });
    };

    const toggleDependency = useCallback((categoryID: string) => {
        const updatedDependencies = category._dependencies.includes(categoryID)
            ? category._dependencies.filter((e) => e !== categoryID)
            : [...category._dependencies, categoryID];
        updateCategory({ ...category, _dependencies: updatedDependencies });
    }, [category, updateCategory]);

    const ToggleIsSequential = () => {
        updateCategory({ ...category, _isSequential: !category._isSequential });
    };

    const ToggleIsShuffled = () => {
        updateCategory({ ...category, _isShuffled: !category._isShuffled });
    };

    useEffect(() => {
        category._dependencies.forEach((categoryID) => {
            if (!Object.keys(categoryDict).includes(categoryID))
                toggleDependency(categoryID);
        });
    }, [categoryDict, category._dependencies, toggleDependency]);

    return (
        <div className={classNames(styles.CategoryHeader)}>
            <input
                className={classNames(styles.CategoryName, styles.Input)}
                type="text"
                value={categoryName}
                onChange={handleUpdateCategoryName}
                onBlur={handleCategoryNameOnBlur}
                style={{
                    width: `${Math.max(categoryName.length + 2, 1)}ch`,
                }}
                spellCheck={false}
            />
            <button className={classNames(styles.AddButton)} onClick={addRow}>
                Add Row
            </button>

            <div className={classNames(styles.CategorySettingsDiv)}>
                {isDependenciesDrawerOpen && (
                    <div className={classNames(styles.DependenciesDrawer)}>
                        {Object.entries(categoryDict).map(
                            (
                                [categoryID, categoryName],
                                dependenciesRowIndex
                            ) => {
                                return (
                                    categoryID !== category._ID && (
                                        <button
                                            onClick={() => {
                                                toggleDependency(categoryID);
                                            }}
                                            className={classNames(
                                                styles.DependenciesRow
                                            )}
                                            key={`${category.name} dependencies ${dependenciesRowIndex} ${categoryID}`}
                                        >
                                            {category._dependencies.includes(
                                                categoryID
                                            ) ? (
                                                <CheckBoxOn />
                                            ) : (
                                                <CheckBoxOff />
                                            )}
                                            <p>{categoryName}</p>
                                        </button>
                                    )
                                );
                            }
                        )}
                    </div>
                )}

                <button
                    className={classNames(styles.SettingsButton, {
                        [styles.toggleOn]: category._dependencies.length > 0,
                    })}
                    onClick={() => {
                        setIsDependenciesDrawerOpen((prev) => !prev);
                    }}
                >
                    <DependenciesIcon className={classNames(styles.Icon)} />
                </button>
                <button
                    className={classNames(styles.SettingsButton, {
                        [styles.toggleOn]: category._isSequential === true,
                    })}
                    onClick={ToggleIsSequential}
                >
                    <IsSequentialIcon className={classNames(styles.Icon)} />
                </button>
                <button
                    className={classNames(styles.SettingsButton, {
                        [styles.toggleOn]: category._isShuffled === true,
                    })}
                    onClick={ToggleIsShuffled}
                >
                    <IsShuffledIcon className={classNames(styles.Icon)} />
                </button>
                <button
                    className={classNames(styles.SettingsButton)}
                    onClick={deleteCategory}
                >
                    <DeleteIcon className={classNames(styles.Icon)} />
                </button>
            </div>
        </div>
    );
}
