import React, { useEffect } from "react";
import { CardCategory, CardRow, STATE } from "../../entity/types.ts";
import InputRow from "./InputRow.tsx";

interface Props {
   category: CardCategory;
   inputRefs: React.RefObject<HTMLInputElement>[];
   rowStates: STATE[];
   handleOnFocus: (event: React.FocusEvent<HTMLInputElement>) => void;
   handleOnBlur: () => void;
   handleOnClick: (
      event: React.MouseEvent<HTMLInputElement, MouseEvent>
   ) => void;
   handleKeyDown: (
      inputIndex: number,
      event: React.KeyboardEvent<HTMLInputElement>,
      row: CardRow
   ) => void;
}

export default function InputCategory({
   category,
   inputRefs,
   rowStates,
   handleOnFocus,
   handleOnBlur,
   handleOnClick,
   handleKeyDown,
}: Props) {
   //

   if (rowStates !== undefined)
      return (
         <>
            {category.rows.map((row, rowIndex) => {
               return (
                  <InputRow
                     row={row}
                     state={rowStates[rowIndex]}
                     handleOnFocus={handleOnFocus}
                     handleOnBlur={handleOnBlur}
                     handleOnClick={handleOnClick}
                     handleKeyDown={(e) => {
                        handleKeyDown(rowIndex, e, row);
                     }}
                     ref={inputRefs[rowIndex]}
                     key={`${category._ID} row ${rowIndex}`}
                  />
               );
            })}
         </>
      );
}
