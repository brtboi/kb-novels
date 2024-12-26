import React, { useEffect, useState } from "react";
import { Card, CardCategory } from "../../entity/types";
import EditCategory from "./EditCategory";
import { ReactComponent as DeleteIcon } from "../../assets/Icons/Delete.svg";
import { ReactComponent as ReorderIcon } from "../../assets/Icons/Reorder.svg";
import { ReactComponent as CollapseIcon } from "../../assets/Icons/Collpase.svg";
import { ReactComponent as ExpandIcon } from "../../assets/Icons/Expand.svg";
import styles from "./editStyles.module.scss";
import classNames from "classnames";
import {
   DragDropContext,
   Draggable,
   DraggableProvidedDragHandleProps,
   Droppable,
   DropResult,
} from "@hello-pangea/dnd";

type Props =
   | {
        // if template
        card: Card;
        cardIndex: number;
        updateCard: (newCard: Card) => void;
        deleteCard?: never;
        template?: never;
        isTemplate: true;
        isCollapsed: boolean;
        toggleIsCollapsed: () => void;
        dragHandleProps?: never;
     }
   | {
        // if normal card
        card: Card;
        cardIndex: number;
        updateCard: (newCard: Card) => void;
        deleteCard: () => void;
        template: Card;
        isTemplate: false;
        isCollapsed: boolean;
        toggleIsCollapsed: () => void;
        dragHandleProps: DraggableProvidedDragHandleProps | null;
     };

export default function EditCard({
   card,
   cardIndex,
   updateCard,
   deleteCard,
   template,
   isTemplate,
   isCollapsed,
   toggleIsCollapsed,
   dragHandleProps,
}: Props) {
   //
   const [extraTemplateCategories, setExtraTemplateCategories] = useState<
      CardCategory[]
   >([]);

   const categoryDict: Record<string, string> = Object.fromEntries(
      card.categories.map((category) => [category._ID, category.name])
   );

   const handleUpdateCategory = (
      categoryIndex: number,
      newCategory: CardCategory
   ) => {
      const updatedCategories = [...card.categories];
      updatedCategories[categoryIndex] = newCategory;

      updateCard({ ...card, categories: updatedCategories });
   };

   const handleAddCategory = (newCategory?: CardCategory) => {
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
         categories: [...card.categories, newCategory ?? blankCategory],
      };

      updateCard(newCard);
   };

   const deleteCategory = (categoryIndex: number) => {
      const updatedCategories = [...card.categories];
      updatedCategories.splice(categoryIndex, 1);

      updateCard({ ...card, categories: updatedCategories });
   };

   const handleCategoriesDragEnd = (result: DropResult<string>) => {
      const { destination, source } = result;

      if (!destination) return; // Dropped outside a valid destination
      if (destination.index === source.index) return; // No change in position

      const _updatedCategories = structuredClone(card.categories);
      const [movedCategory] = _updatedCategories.splice(source.index, 1);
      _updatedCategories.splice(destination.index, 0, movedCategory);

      updateCard({ ...card, categories: _updatedCategories });
   };

   useEffect(() => {
      if (!isTemplate) {
         setExtraTemplateCategories(
            template.categories.filter(
               (templateCategory) =>
                  !card.categories.some(
                     (cardCategory) => templateCategory._ID === cardCategory._ID
                  )
            )
         );
      }
   }, [template, card, isTemplate]);

   return (
      <>
         <div
            className={classNames(styles.Card)}
            style={{ marginBottom: isCollapsed ? 0 : "1rem" }}
         >
            {/* Side Panel */}
            <div className={styles.CardSidePanel}>
               {/* Reorder Button */}
               {isTemplate ? (
                  <div style={{ width: "24px" }} />
               ) : (
                  <button
                     {...dragHandleProps}
                     className={classNames(styles.ReorderButton)}
                  >
                     <ReorderIcon className={classNames(styles.Icon)} />
                  </button>
               )}

               {/* Collapse Button */}
               <button
                  onClick={() => {
                     toggleIsCollapsed();
                  }}
                  className={classNames(styles.CollapseButton, {
                     [styles.collapsed]: isCollapsed,
                  })}
               >
                  {isCollapsed ? (
                     <ExpandIcon className={styles.Icon} />
                  ) : (
                     <CollapseIcon className={classNames(styles.Icon)} />
                  )}
                  <div className={styles.CollapseButtonBracket} />
               </button>
            </div>

            {/* Card Body */}
            <div className={styles.CardBody}>
               {/* Card Header: Name & Collapse info */}
               <div className={styles.CardHeader}>
                  {/*  */}
                  {/* Card Name */}
                  {isTemplate ? (
                     <p>Template |</p>
                  ) : (
                     <p>{`Card ${cardIndex} |`}</p>
                  )}
                  {/*  */}
                  {/* if collpased Card info (first category row) */}
                  {isCollapsed && (
                     <p>
                        &nbsp;
                        {`${card.categories[0].rows[0].label}: ${card.categories[0].rows[0].answers[0]} |`}
                     </p>
                  )}
                  {/*  */}
                  {/* Delete Button */}
                  &nbsp;
                  <button
                     onClick={deleteCard}
                     className={classNames(styles.SettingsButton)}
                  >
                     <DeleteIcon className={classNames(styles.Icon)} />
                  </button>
               </div>

               {/* Card Categories and stuff when not collapsed */}
               {!isCollapsed && (
                  <>
                     {/* categories */}
                     <DragDropContext onDragEnd={handleCategoriesDragEnd}>
                        <Droppable
                           droppableId={`CategoryDroppable_${cardIndex}`}
                        >
                           {(provided) => (
                              <div
                                 className={styles.CardCategoriesDiv}
                                 {...provided.droppableProps}
                                 ref={provided.innerRef}
                              >
                                 {card.categories.map(
                                    (category, categoryIndex) => (
                                       <Draggable
                                          index={categoryIndex}
                                          draggableId={`Category ${cardIndex}|${categoryIndex}`}
                                          key={`Category ${cardIndex}|${categoryIndex}`}
                                       >
                                          {(provided) => (
                                             <div
                                                {...provided.draggableProps}
                                                ref={provided.innerRef}
                                             >
                                                <EditCategory
                                                   category={category}
                                                   updateCategory={(
                                                      newCategory
                                                   ) => {
                                                      handleUpdateCategory(
                                                         categoryIndex,
                                                         newCategory
                                                      );
                                                   }}
                                                   deleteCategory={() => {
                                                      deleteCategory(
                                                         categoryIndex
                                                      );
                                                   }}
                                                   isTemplate={isTemplate}
                                                   categoryDict={categoryDict}
                                                   dragHandleProps={
                                                      provided.dragHandleProps
                                                   }
                                                   key={`category ${category.name} | ${categoryIndex}`}
                                                />
                                             </div>
                                          )}
                                       </Draggable>
                                    )
                                 )}
                                 {provided.placeholder}
                              </div>
                           )}
                        </Droppable>
                     </DragDropContext>

                     {/* add new category buttons */}
                     <div className={classNames(styles.AddCategoryDiv)}>
                        <p>Add Category:&nbsp;</p>
                        <button
                           onClick={() => {
                              handleAddCategory();
                           }}
                           className={styles.AddCategoryButton}
                        >
                           New
                        </button>
                        {extraTemplateCategories.map(
                           (extraTemplateCategory) => (
                              <>
                                 <p>,&nbsp;</p>
                                 <button
                                    onClick={() => {
                                       handleAddCategory(extraTemplateCategory);
                                    }}
                                    className={styles.AddCategoryButton}
                                 >
                                    {extraTemplateCategory.name}
                                 </button>
                              </>
                           )
                        )}
                     </div>
                  </>
               )}
            </div>
         </div>
      </>
   );
}
