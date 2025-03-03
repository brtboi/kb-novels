import classNames from "classnames";
import styles from "./editStyles.module.scss";
import { ReactComponent as DependenciesIcon } from "../../assets/Icons/Dependencies.svg";
import { ReactComponent as CheckBoxOff } from "../../assets/Icons/CheckBoxOff.svg";
import { ReactComponent as CheckBoxOn } from "../../assets/Icons/CheckBoxOn.svg";
import { ReactComponent as IsSequentialIcon } from "../../assets/Icons/123.svg";
import { ReactComponent as IsShuffledIcon } from "../../assets/Icons/Shuffle.svg";
import { ReactComponent as DeleteIcon } from "../../assets/Icons/Delete.svg";
import { ReactComponent as ReorderIcon } from "../../assets/Icons/Reorder.svg";
import { CardCategory, CardRow } from "../../entity/types";
import { useCallback, useEffect, useState } from "react";
import { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";

interface Props {
   category: CardCategory;
   updateCategory: (updatedCategory: CardCategory) => void;
   deleteCategory: () => void;
   categoryDict: Record<string, string>;
   dragHandleProps: DraggableProvidedDragHandleProps | null;
}

export default function EditCategoryHeader({
   category,
   updateCategory,
   deleteCategory,
   categoryDict,
   dragHandleProps,
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
         type: "text",
         cased: false,
      };

      updateCategory({ ...category, rows: [...category.rows, newRow] });
   };

   const toggleDependency = useCallback(
      (categoryID: string) => {
         const updatedDependencies = category.deps.includes(categoryID)
            ? category.deps.filter((e) => e !== categoryID)
            : [...category.deps, categoryID];
         updateCategory({ ...category, deps: updatedDependencies });
      },
      [category, updateCategory]
   );

   const ToggleIsSequential = () => {
      updateCategory({ ...category, seq: !category.seq });
   };

   const ToggleIsShuffled = () => {
      updateCategory({ ...category, shfl: !category.shfl });
   };

   useEffect(() => {
      category.deps.forEach((categoryID) => {
         if (!Object.keys(categoryDict).includes(categoryID))
            toggleDependency(categoryID);
      });
   }, [categoryDict, category.deps, toggleDependency]);

   return (
      <div className={classNames(styles.CategoryHeader)}>
         {/* Category Name */}
         <div className={styles.CategoryNameDiv}>
            <button
               {...dragHandleProps}
               className={classNames(styles.ReorderButton)}
            >
               <ReorderIcon className={classNames(styles.Icon)} />
            </button>
            <input
               className={classNames(styles.CategoryName, styles.Input)}
               type="text"
               value={categoryName}
               onChange={handleUpdateCategoryName}
               onBlur={handleCategoryNameOnBlur}
               style={{
                  width: `${Math.max(categoryName.length, 1)}ch`,
               }}
               spellCheck={false}
            />
         </div>

         {/* Add Row Button */}
         <button className={classNames(styles.AddButton)} onClick={addRow}>
            Add Row
         </button>

         {/* Category Settings */}
         <div className={classNames(styles.CategorySettingsDiv)}>
            {isDependenciesDrawerOpen && (
               <div className={classNames(styles.DependenciesDrawer)}>
                  {Object.entries(categoryDict).map(
                     ([categoryID, categoryName], dependenciesRowIndex) =>
                        categoryID !== category._ID && (
                           <button
                              onClick={() => {
                                 toggleDependency(categoryID);
                              }}
                              className={classNames(styles.DependenciesRow)}
                              key={`${category.name} dependencies ${dependenciesRowIndex} ${categoryID}`}
                           >
                              {category.deps.includes(categoryID) ? (
                                 <CheckBoxOn />
                              ) : (
                                 <CheckBoxOff />
                              )}
                              <p>{categoryName}</p>
                           </button>
                        )
                  )}
               </div>
            )}

            <button
               className={classNames(styles.SettingsButton, {
                  [styles.toggleOn]: category.deps.length > 0,
               })}
               onClick={() => {
                  setIsDependenciesDrawerOpen((prev) => !prev);
               }}
            >
               <DependenciesIcon className={classNames(styles.Icon)} />
            </button>
            <button
               className={classNames(styles.SettingsButton, {
                  [styles.toggleOn]: category.seq === true,
               })}
               onClick={ToggleIsSequential}
            >
               <IsSequentialIcon className={classNames(styles.Icon)} />
            </button>
            <button
               className={classNames(styles.SettingsButton, {
                  [styles.toggleOn]: category.shfl === true,
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
