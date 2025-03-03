import React, { useState } from "react";
import classNames from "classnames";
import styles from "./editStyles.module.scss";
import { CardRow, RowType } from "../../entity/types";
import { ReactComponent as AddIcon } from "../../assets/Icons/Add.svg";
import { ReactComponent as DeleteIcon } from "../../assets/Icons/Delete.svg";
import { ReactComponent as CaseSensitiveIcon } from "../../assets/Icons/Aa.svg";
import { ReactComponent as TextIcon } from "../../assets/Icons/Text.svg";
import { ReactComponent as NumberIcon } from "../../assets/Icons/Number.svg";
import { ReactComponent as NameIcon } from "../../assets/Icons/Person.svg";

interface RowProps {
   row: CardRow;
   updateRow: (updatedRow: CardRow) => void;
   deleteRow: () => void;
   isTemplate: boolean;
}

const getRowTypesArr = (rowType: RowType) => {
   const rowTypesArr: RowType[] = ["text", "name", "number"];
   const index = rowTypesArr.indexOf(rowType);
   return [...rowTypesArr.slice(index + 1), ...rowTypesArr.slice(0, index + 1)];
};

const IconByType: Record<RowType, JSX.Element> = {
   text: <TextIcon className={styles.Icon} />,
   name: <NameIcon className={styles.Icon} />,
   number: <NumberIcon className={styles.Icon} />,
};

export default function Row({
   row,
   updateRow,
   deleteRow,
   isTemplate,
}: RowProps) {
   //
   const [label, setLabel] = useState<string>(row.label);
   const [answers, setAnswers] = useState<string[]>(row.answers);

   const rowTypesArr = getRowTypesArr(row.type);
   const [rowType, setRowType] = useState<RowType>(row.type);
   const [isRowTypesOpen, setIsRowTypesOpen] = useState<boolean>(false);

   const handleLabelOnBlur = () => {
      updateRow({ ...row, label: label });
   };

   const handleAnswerOnBlur = () => {
      updateRow({ ...row, answers: answers });
   };

   const handleLabelChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newLabel = e.target.value;
      setLabel(newLabel);
   };

   const handleAnswerChange = (
      answerIndex: number,
      e: React.ChangeEvent<HTMLTextAreaElement>
   ) => {
      setAnswers((prev) => {
         const updatedAnswers = structuredClone(prev);
         updatedAnswers[answerIndex] = e.target.value;
         return updatedAnswers;
      });
   };

   const addAnswer = () => {
      updateRow({ ...structuredClone(row), answers: [...row.answers, ""] });
   };

   const deleteAnswer = (answerIndex: number) => {
      const updatedAnswers = [...row.answers];
      updatedAnswers.splice(answerIndex, 1);
      updateRow({ ...structuredClone(row), answers: updatedAnswers });
   };

   const updateRowType = (newRowType: RowType) => {
      setTimeout(() => {
         updateRow({ ...structuredClone(row), type: newRowType });
      }, 500);
   };

   const toggleIsCaseSensitive = () => {
      updateRow({
         ...structuredClone(row),
         cased: !row.cased,
      });
   };

   return (
      <div className={classNames(styles.CardRow)}>
         {/* Label */}
         <div className={classNames(styles.LabelDiv)}>
            <textarea
               className={classNames(styles.Input, styles.Label)}
               value={label}
               onChange={handleLabelChange}
               onBlur={handleLabelOnBlur}
               spellCheck={false}
            />
            <p className={classNames(styles.LabelColon)}>:</p>
         </div>

         {/* answer div if not template*/}
         {isTemplate ? (
            <div className={styles.AnswerDiv} />
         ) : (
            <div className={classNames(styles.AnswerDiv)}>
               {row.answers.map((answer, answerIndex) => (
                  <div
                     className={classNames(styles.AnswerRow)}
                     key={`${row.label + answer + answerIndex}`}
                  >
                     <textarea
                        className={classNames(styles.Input, styles.Answer)}
                        value={answers[answerIndex] ?? ""}
                        onChange={(e) => {
                           handleAnswerChange(answerIndex, e);
                        }}
                        onBlur={handleAnswerOnBlur}
                        spellCheck={false}
                     />

                     {/* Add / Delete Answer Button */}
                     <div className={styles.AddAnswerDiv}>
                        {answerIndex === 0 ? (
                           <button
                              onClick={addAnswer}
                              className={classNames(styles.AddButton)}
                           >
                              <AddIcon className={classNames(styles.Icon)} />
                           </button>
                        ) : (
                           <button
                              onClick={() => {
                                 deleteAnswer(answerIndex);
                              }}
                              className={classNames(styles.DeleteAnswerButton)}
                           >
                              <DeleteIcon className={classNames(styles.Icon)} />
                           </button>
                        )}
                     </div>
                  </div>
               ))}
            </div>
         )}

         {/* Row Settings */}
         <div className={styles.RowSettingsDivDiv}>
            <div
               className={classNames(styles.RowSettingsDiv, {
                  [styles.expanded]: isRowTypesOpen,
               })}
               style={{
                  width: isRowTypesOpen ? "14rem" : "9rem",
                  transition: "width 0.5s ease",
               }}
            >
               <div
                  className={classNames(styles.RowTypeDiv)}
                  onMouseEnter={() => {
                     console.log("open div");
                     setIsRowTypesOpen(true);
                  }}
                  onMouseLeave={() => {
                     setIsRowTypesOpen(false);
                     updateRowType(rowType);
                  }}
                  style={{
                     width: isRowTypesOpen ? "7.5rem" : "1.5rem",
                     transition: "width 0.5s ease",
                  }}
               >
                  {rowTypesArr.map((_rowType, rowTypeIndex) => (
                     <button
                        onClick={() => {
                           setRowType(_rowType);
                        }}
                        className={classNames(styles.SettingsButton, {
                           [styles.toggleOn]: rowType === _rowType,
                        })}
                        style={{
                           position:
                              _rowType === rowType ? "static" : "absolute",
                           transform: isRowTypesOpen
                              ? `translateX(${-2.5 * (2 - rowTypeIndex)}rem)`
                              : `translateX(0)`,
                           transition: "transform 0.5s ease",
                        }}
                        key={`${_rowType}`}
                     >
                        {IconByType[_rowType]}
                     </button>
                  ))}
               </div>
               <button
                  onClick={toggleIsCaseSensitive}
                  className={classNames(styles.SettingsButton, {
                     [styles.toggleOn]: row.cased,
                  })}
               >
                  <CaseSensitiveIcon className={classNames(styles.Icon)} />
               </button>
               <button onClick={deleteRow} className={styles.SettingsButton}>
                  <DeleteIcon className={styles.Icon} />
               </button>
            </div>
         </div>
      </div>
   );
}
