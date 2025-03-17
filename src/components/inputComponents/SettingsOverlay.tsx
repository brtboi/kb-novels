import classNames from "classnames";
import styles from "./inputStyles.module.scss";
import { Card, CardCategory, STATE } from "../../entity/types";
import { createRef, useEffect, useRef } from "react";

interface Props {
   isSettings: boolean;
   template: Card;
   categorySettings: Record<string, STATE>;
   changeCategorySettings: (categoryID: string, newState: STATE) => void;
   startReview: () => void;
}

export default function SettingsOverlay({
   isSettings,
   template,
   categorySettings,
   changeCategorySettings,
   startReview,
}: Props) {
   //
   const buttonRefs = useRef<React.RefObject<HTMLButtonElement>[]>([]);

   const handleOnMouseOver = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.currentTarget.focus();
   };

   const handleOnClick = (category: CardCategory) => {
      switch (categorySettings[category._ID]) {
         case STATE.ASK:
            changeCategorySettings(category._ID, STATE.SHOW);
            return;

         case STATE.SHOW:
            changeCategorySettings(category._ID, STATE.DISABLE);
            return;

         case STATE.DISABLE:
            changeCategorySettings(category._ID, STATE.ASK);
            return;

         default:
            console.error(
               `Error: invalid categorySettings for category ${
                  category.name
               } with ID ${category._ID} and state ${
                  categorySettings[category._ID]
               }. categorySettings should only be ASK, SHOW, or DISABLE`
            );
      }
   };

   const handleOnKeyDown = (
      index: number,
      event: React.KeyboardEvent<HTMLButtonElement>
   ) => {
      if (event.key === "ArrowUp" || event.key === " W") {
         buttonRefs.current[
            (index + buttonRefs.current.length - 1) % buttonRefs.current.length
         ].current?.focus();
      } else if (event.key === "ArrowDown" || event.key === "S") {
         buttonRefs.current[
            (index + 1) % buttonRefs.current.length
         ].current?.focus();
      }
   };

   // initialize buttonRefs
   useEffect(() => {
      buttonRefs.current = template.cats.map(() =>
         createRef<HTMLButtonElement>()
      );
   }, [template]);

   // focus first button on open
   useEffect(() => {
      if (isSettings) {
         buttonRefs.current[0].current?.focus();
      }
   }, [isSettings]);

   return (
      <div
         className={classNames(styles.SettingsOverlay)}
         style={{
            opacity: isSettings ? 1 : 0,
            pointerEvents: isSettings ? "auto" : "none",
         }}
      >
         <div className={classNames(styles.SettingsDiv)}>
            <p>settings test</p>

            {/* settings buttons. one per category */}
            {template.cats.map((category, index) => (
               <button
                  className={classNames(styles.SettingsButton)}
                  onMouseOver={handleOnMouseOver}
                  onClick={() => {
                     handleOnClick(category);
                  }}
                  onKeyDown={(e) => {
                     handleOnKeyDown(index, e);
                  }}
                  ref={buttonRefs.current[index]}
                  key={`settingsButton - ${category._ID}`}
               >
                  <p>{category.name}</p>
                  <p>
                     <i>{categorySettings[category._ID]}</i>
                  </p>
               </button>
            ))}

            <div
               style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 10,
                  justifyContent: "end",
               }}
            >
               <button
                  className={styles.SettingsButton}
                  onMouseOver={handleOnMouseOver}
                  onClick={startReview}
               >
                  Start Review
               </button>
            </div>
         </div>
      </div>
   );
}
