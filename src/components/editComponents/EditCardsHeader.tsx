import { Card, RowType } from "../../entity/types";
import styles from "./editStyles.module.scss";
import { ReactComponent as ArrowUpIcon } from "../../assets/Icons/ArrowUp.svg";
import { ReactComponent as ArrowDownIcon } from "../../assets/Icons/ArrowDown.svg";
import { useState } from "react";

interface Props {
   template: Card;
   setCards: React.Dispatch<React.SetStateAction<Card[] | null>>;
   toggleIsCollapsedAll: (isCollapsed: boolean) => void;
}

export default function EditCardsHeader({
   template,
   setCards,
   toggleIsCollapsedAll,
}: Props) {
   //
   const [isSortMenuOpen, setIsSortMenuOpen] = useState<boolean>(false);

   const sortCards = (categoryID: string, direction: 1 | -1) => {
      // get the actual answer i'm sorting by (first answer of first row of category specified)
      const getFirstRow = (card: Card) =>
         card.categories.find((category) => category._ID === categoryID)
            ?.rows[0];

      const getFirstAnswer = (card: Card) => {
         try {
            return getFirstRow(card)?.answers[0] || "";
         } catch (error) {
            return "";
         }
      };

      const isNumber = getFirstRow(template)?._type === ("number" as RowType);

      setCards((prev) => {
         const _prev = structuredClone(prev);

         console.log(isNumber, direction);

         if (isNumber && direction === 1) {
            _prev?.sort(
               (a, b) =>
                  parseFloat(getFirstAnswer(a)) - parseFloat(getFirstAnswer(b))
            );
         } else if (isNumber && direction === -1) {
            _prev?.sort(
               (a, b) =>
                  parseFloat(getFirstAnswer(b)) - parseFloat(getFirstAnswer(a))
            );
         } else if (direction === 1) {
            _prev?.sort((a, b) =>
               getFirstAnswer(a).localeCompare(getFirstAnswer(b))
            );
         } else {
            _prev?.sort((a, b) =>
               getFirstAnswer(b).localeCompare(getFirstAnswer(a))
            );
         }

         return _prev;
      });

      setIsSortMenuOpen(false);
   };

   return (
      <div className={styles.CardsHeader}>
         <p>Cards:</p>
         <button
            onClick={() => {
               setIsSortMenuOpen((prev) => !prev);
            }}
         >
            Sort
         </button>
         {/* Sort Menu */}
         {isSortMenuOpen && (
            <div className={styles.SortMenu}>
               {template.categories.map((category) => (
                  <div className={styles.SortMenuRow}>
                     <p>{category.name}</p>
                     {/* Sort Menu Buttons */}
                     <div className={styles.SortMenuButtons}>
                        <button
                           onClick={() => {
                              sortCards(category._ID, 1);
                           }}
                           className={styles.SettingsButton}
                        >
                           <ArrowUpIcon className={styles.Icon} />
                        </button>
                        <button
                           onClick={() => {
                              sortCards(category._ID, -1);
                           }}
                           className={styles.SettingsButton}
                        >
                           <ArrowDownIcon className={styles.Icon} />
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         )}
         |
         <button
            onClick={() => {
               toggleIsCollapsedAll(true);
            }}
         >
            Collpase All
         </button>
         |
         <button
            onClick={() => {
               toggleIsCollapsedAll(false);
            }}
         >
            Open All
         </button>
      </div>
   );
}
