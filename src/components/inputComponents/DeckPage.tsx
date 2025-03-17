import React, {
   useState,
   useEffect,
   useRef,
   createRef,
   useCallback,
} from "react";
import { Card, CardRow, STATE } from "../../entity/types.ts";
import { useParams } from "react-router-dom";
import InputCategory from "./InputCategory.tsx";
import classNames from "classnames";
import styles from "./inputStyles.module.scss";
import SettingsOverlay from "./SettingsOverlay.tsx";
import { getDeckById } from "../../firebase/db.ts";

type DrawPileItem = {
   cardIndex: number;
   suit: 0 | 1 | 2 | 3;
   // suitIndex: number;
};

interface CaretData {
   active: boolean;
   element: HTMLInputElement | null;
   top: number;
   left: number;
}

export default function DeckPage() {
   const { deckId } = useParams<{ deckId: string }>();

   const [isPageFirstLoaded, setIsPageFirstLoaded] = useState<boolean>(true);
   const [isCardFirstLoaded, setIsCardFirstLoaded] = useState<boolean>(true);

   const [cards, setCards] = useState<Card[] | null>(null);
   const [template, setTemplate] = useState<Card | null>(null);
   const [currentCard, setCurrentCard] = useState<DrawPileItem>({
      cardIndex: 0,
      suit: 0,
      // suitIndex: 0,
   });

   const cardSuits = useRef<Set<number>[]>([
      new Set(),
      new Set(),
      new Set(),
      new Set(),
   ]);

   // const drawPile = useRef<DrawPileItem[]>([]);
   const drawPile = useRef<Array<DrawPileItem>>([]);
   const cardPerformance = useRef<-1 | 0 | 1>(1);

   const inputRefs = useRef<
      Record<string, React.RefObject<HTMLInputElement>[]>
   >({});
   const sequential = useRef<Record<string, boolean>>({});
   const _dependencies = useRef<Record<string, string[]>>({});

   const [rowStates, setRowStates] = useState<Record<string, STATE[]>>({});
   const [categorySettings, setCategorySettings] = useState<
      Record<string, STATE>
   >({});
   const [isSettings, setIsSettings] = useState<boolean>(false);
   // redo mode if something in the card was incorrect
   const [isRedo, setIsRedo] = useState<boolean>(false);

   const [isCardDone, setIsCardDone] = useState<boolean>(false);

   const [caretData, setCaretData] = useState<CaretData>({
      active: false,
      element: null,
      top: 0,
      left: 0,
   });

   // for the last p element to get fontWidth
   const fontTestElement = useRef<HTMLParagraphElement>(null);
   const fontWidth = useRef<number>(0);

   const moveCard = (fromSuit: number, value: number, toSuit: number) => {
      if (fromSuit < 0 || fromSuit > 3 || toSuit < 0 || toSuit > 3) {
         console.error(
            `Error moving card: from fromSuit = ${fromSuit} to toSuit = ${toSuit}`
         );
         return;
      }

      if (!cardSuits.current[fromSuit].has(value)) {
         console.error(
            `Error moving card: from fromSuit = ${fromSuit} to toSuit = ${toSuit}. fromSuit does not have value = ${value}`
         );
      }

      cardSuits.current[fromSuit].delete(value);
      cardSuits.current[toSuit].add(value);
   };

   const getRandomCards = (fromSuit: number, n: number): Array<number> => {
      const toMove = Array.from(cardSuits.current[fromSuit])
         .sort(() => Math.random() - 0.5)
         .splice(0, Math.min(n, cardSuits.current[fromSuit].size));

      return toMove;
   };

   const getFlatIndex = useCallback(
      (categoryID: string, rowIndex: number) => {
         let index = 0;

         for (const category of cards![currentCard.cardIndex].cats) {
            if (category._ID === categoryID) {
               index += rowIndex;
               break;
            }

            index += category.rows.length;
         }

         return index;
      },
      [cards, currentCard]
   );

   const getIsAnswerCorrect = useCallback((value: string, row: CardRow) => {
      if (row.type === "name") {
         const allPossibleNames = [];

         for (const name of row.answers) {
            const words = name.trim().split(/\s+/); // Split full name into words

            // Generate all viable "last names" for this full name
            for (let i = 1; i <= words.length; i++) {
               allPossibleNames.push(words.slice(-i).join(" "));
            }
         }

         return allPossibleNames.some((e) =>
            row.cased ? e === value : e.toUpperCase() === value.toUpperCase()
         );
      } else if (row.type === "text") {
         return row.answers.some((e) =>
            row.cased ? e === value : e.toUpperCase() === value.toUpperCase()
         );
      } else if (row.type === "number") {
         return row.answers.some((e) => parseFloat(e) === parseFloat(value));
      }
   }, []);

   const focusFirstInput = useCallback(() => {
      if (cards === null) {
         console.error("Error focusing first input: cards is null");
         return;
      }

      const lastCategory =
         cards[currentCard.cardIndex].cats[
            cards[currentCard.cardIndex].cats.length - 1
         ];

      focusNextInput(lastCategory._ID, lastCategory.rows.length - 1, 1, false);
   }, [cards, currentCard]);

   const moveCaret = (element: HTMLInputElement) => {
      setTimeout(() => {
         const rect = element.getBoundingClientRect();
         setCaretData({
            active: true,
            element: element,
            top: rect.top,
            left: rect.left + (element.selectionStart || 0) * fontWidth.current,
         });
      }, 2);
   };

   const updateRowState = (
      categoryID: string,
      rowIndex: number,
      newState: STATE
   ) => {
      setRowStates((prev) => {
         const updatedRowStates = structuredClone(prev);
         const updatedRowStatesCategory = [...prev[categoryID]!];

         updatedRowStatesCategory[rowIndex] = newState;

         updatedRowStates[categoryID] = updatedRowStatesCategory;
         return updatedRowStates;
      });
      checkIsSequential();
      checkDependencies();
   };

   const handleOnFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      moveCaret(event.target);
   };

   const handleOnBlur = () => {
      setCaretData((prev) => ({
         ...prev,
         active: false,
      }));
   };

   const handleOnClick = (
      event: React.MouseEvent<HTMLInputElement, MouseEvent>
   ) => {
      moveCaret(event.currentTarget);
   };

   const handleOnKeyDown = (
      categoryID: string,
      rowIndex: number,
      event: React.KeyboardEvent<HTMLInputElement>,
      row: CardRow
   ) => {
      const value = event.currentTarget.value;
      switch (event.key) {
         case "Enter":
            event.preventDefault();
            const isAnswerCorrect = getIsAnswerCorrect(value, row);

            if (value === "") {
               focusNextInput(categoryID, rowIndex, 1, false);
               //
            } else if (isAnswerCorrect) {
               inputRefs.current[categoryID][rowIndex].current!.value = "";
               updateRowState(categoryID, rowIndex, STATE.CORRECT);

               focusNextInput(categoryID, rowIndex, 1, isAnswerCorrect);
               //
            } else if (value === "idk") {
               inputRefs.current[categoryID][rowIndex].current!.value = "";
               cardPerformance.current = -1;
               setIsRedo(true);
               updateRowState(categoryID, rowIndex, STATE.INCORRECT);
               focusNextInput(categoryID, rowIndex, 1, true);
               //
            } else {
               inputRefs.current[categoryID][rowIndex].current?.select();
            }

            break;

         case "ArrowUp":
            event.preventDefault();
            focusNextInput(categoryID, rowIndex, -1, false);
            break;

         case "ArrowDown":
            event.preventDefault();
            focusNextInput(categoryID, rowIndex, 1, false);
            break;

         default:
            moveCaret(event.currentTarget);
      }
   };

   const redo = useCallback(() => {
      setIsRedo(false);
      setIsCardDone(false);
      setRowStates((prev) => {
         const _rowStates = structuredClone(prev);

         for (const [category, states] of Object.entries(prev)) {
            for (const stateIndex in states) {
               if (states[stateIndex] === STATE.INCORRECT) {
                  _rowStates[category][stateIndex] = STATE.ASK;
               }
            }
         }

         return _rowStates;
      });

      focusFirstInput();
   }, [focusFirstInput]);

   const checkIsSequential = useCallback(() => {
      if (!cards) {
         console.error("Error: cards is null");
         return;
      }

      setRowStates((prev) => {
         const updatedRowStates = structuredClone(prev);

         for (const category of cards[currentCard.cardIndex].cats) {
            if (category.seq) {
               const states = updatedRowStates[category._ID];

               for (let i = 1; i < states.length; i++) {
                  if (
                     states[i] === STATE.HIDE &&
                     (states[i - 1] === STATE.CORRECT ||
                        states[i - 1] === STATE.INCORRECT)
                  ) {
                     const _rowStatesTemp = [...prev[category._ID]];
                     _rowStatesTemp[i] = STATE.ASK;

                     updatedRowStates[category._ID] = _rowStatesTemp;
                     break;
                  }
               }
            }
         }

         return updatedRowStates;
      });
   }, [cards, currentCard]);

   // lowkey checks settings as well. more like check categories
   const checkDependencies = useCallback(() => {
      if (!cards) {
         console.error("Error: cards is null");
         return;
      }

      setRowStates((prev) => {
         const updatedRowStates = structuredClone(prev);

         // Record<categoryID, boolean>
         // true is all done and false is not done (has some ask or hide)
         const categoryStates = Object.entries(prev).reduce(
            (acc, [categoryID, states]) => ({
               ...acc,
               [categoryID]: states.every(
                  (e) => e !== STATE.ASK && e !== STATE.HIDE
               ),
            }),
            {} as Record<string, boolean>
         );

         for (const category of cards[currentCard.cardIndex].cats) {
            const isDependeniesFulfilled = _dependencies.current[
               category._ID
            ].every((dependencyID) => categoryStates[dependencyID]);

            // if category setting is show
            if (categorySettings[category._ID] === STATE.SHOW) {
               updatedRowStates[category._ID] = prev[category._ID].map(
                  () => STATE.SHOW
               );

               // if the category is currently hidden and all of it's dependencies are fulfilled
            } else if (
               isDependeniesFulfilled &&
               prev[category._ID]?.every((state) => state === STATE.HIDE) &&
               categorySettings[category._ID] === STATE.ASK
            ) {
               if (category.seq) {
                  updatedRowStates[category._ID] = prev[category._ID].map(
                     (_, i) => (i === 0 ? STATE.ASK : STATE.HIDE)
                  );
               } else {
                  updatedRowStates[category._ID] = prev[category._ID].map(
                     () => STATE.ASK
                  );
               }

               // if the category isn't STATE.SHOW nor STATE.DISABLE and dependencies aren't fulfilled
            } else if (
               !isDependeniesFulfilled &&
               !prev[category._ID]?.every(
                  (state) => state === STATE.SHOW || state === STATE.DISABLE
               )
            ) {
               updatedRowStates[category._ID] = prev[category._ID].map(
                  () => STATE.HIDE
               );
            }
         }

         return updatedRowStates;
      });
   }, [cards, currentCard, categorySettings]);

   const changeCategorySettings = useCallback(
      (categoryID: string, newState: STATE) => {
         console.log("change category settings run");
         setCategorySettings((prevCategorySettings) => {
            const _updatedCategorySettings =
               structuredClone(prevCategorySettings);
            _updatedCategorySettings[categoryID] = newState;

            if (
               cards &&
               !cards[currentCard.cardIndex].cats.some(
                  (category) => category._ID === categoryID
               )
            ) {
               return _updatedCategorySettings;
            }

            setRowStates((prevRowStates) => {
               const _updatedRowStates = structuredClone(prevRowStates);

               switch (newState) {
                  case STATE.ASK:
                     _updatedRowStates[categoryID] = prevRowStates[
                        categoryID
                     ].map((_) => STATE.HIDE);
                     break;

                  case STATE.SHOW:
                     _updatedRowStates[categoryID] = prevRowStates[
                        categoryID
                     ].map((_) => STATE.SHOW);
                     break;

                  case STATE.DISABLE:
                     _updatedRowStates[categoryID] = prevRowStates[
                        categoryID
                     ].map((_) => STATE.DISABLE);
               }

               return _updatedRowStates;
            });

            return _updatedCategorySettings;
         });

         setTimeout(() => {
            checkIsSequential();
            checkDependencies();
         });
      },
      [cards, currentCard, checkDependencies, checkIsSequential]
   );

   const focusNextInput = useCallback(
      (
         categoryID: string,
         rowIndex: number,
         step: -1 | 1,
         isRowAnswered: boolean
      ) => {
         const inputRefsFlat = Array.from(
            Object.values(inputRefs.current)
         ).flat();

         setRowStates((prev) => {
            const flatIndex = getFlatIndex(categoryID, rowIndex);
            const rowStatesFlat = Array.from(Object.values(prev)).flat();

            let nextIndex =
               (flatIndex + inputRefsFlat.length + step) % inputRefsFlat.length;

            while (
               nextIndex !== flatIndex &&
               rowStatesFlat[nextIndex] !== STATE.ASK
            ) {
               nextIndex =
                  (nextIndex + inputRefsFlat.length + step) %
                  inputRefsFlat.length;
            }

            if (nextIndex === flatIndex && isRowAnswered) {
               setTimeout(() => {
                  setIsCardDone(true);
               }, 10);
            }

            setTimeout(() => {
               inputRefsFlat[nextIndex].current?.focus();
            });
            return prev;
         });
      },
      [getFlatIndex]
   );

   const refillDrawPile = useCallback(() => {
      // 4 random values from suit0
      const _randomSuit0 = getRandomCards(0, 4);

      _randomSuit0.forEach((value) => {
         moveCard(0, value, 1);
      });

      const _randomSuit3: DrawPileItem[] = getRandomCards(3, 3).map((i) => ({
         cardIndex: i,
         suit: 3,
      }));

      drawPile.current.push(
         ..._randomSuit3,
         ...[...cardSuits.current[2]].map((i) => ({
            cardIndex: i,
            suit: 2 as 2,
         })),
         ...[...cardSuits.current[1]].map((i) => ({
            cardIndex: i,
            suit: 1 as 1,
         }))
      );

      // push all of suit 2 and suit 1 to draw pile
      // drawPile.current.push(
      //    ...cardSuits.current[2].map((cardIndex, suitIndex) => ({
      //       cardIndex: cardIndex,
      //       suit: 2 as 2,
      //       suitIndex: suitIndex,
      //    })),
      //    ...cardSuits.current[1].map((cardIndex, suitIndex) => ({
      //       cardIndex: cardIndex,
      //       suit: 1 as 1,
      //       suitIndex: suitIndex,
      //    })),
      //    ...structuredClone(_suit3)
      // );

      // refill drawPile with sui1, sui2, and 3 cards from suit3
      // if (drawPile.current.length === 0) {
      //    const suit3Cards: DrawPileItem[] = [];

      //    while (suit3Cards.length < Math.min(3, cardSuits.current[3].length)) {
      //       const randomIndex = Math.floor(
      //          Math.random() * cardSuits.current[3].length
      //       );
      //       suit3Cards.push({
      //          cardIndex: cardSuits.current[3][randomIndex],
      //          suit: 3,
      //          suitIndex: randomIndex,
      //       });
      //    }

      //    drawPile.current.push(
      //       ...suit3Cards,
      //       ...cardSuits.current[2].map((cardIndex, suitIndex) => ({
      //          cardIndex: cardIndex,
      //          suit: 2 as Suit,
      //          suitIndex: suitIndex,
      //       })),
      //       ...cardSuits.current[1].map((cardIndex, suitIndex) => ({
      //          cardIndex: cardIndex,
      //          suit: 1 as Suit,
      //          suitIndex: suitIndex,
      //       }))
      //    );
      // }
   }, []);

   // updates suits, refilldrawpile, & getnextcard & reset redo
   const getNextCard = useCallback(
      (isInit: boolean = false) => {
         setIsCardDone(false);
         setIsRedo(false);

         if (drawPile.current.length === 0) {
            refillDrawPile();
            console.log("Draw pile refilled:", drawPile.current);
         }

         // isInit === true only when run by the initializing cards useEffect
         if (!isInit) {
            const _toSuit = currentCard.suit + cardPerformance.current;
            const toSuit = Math.min(3, Math.max(1, _toSuit));

            console.log(currentCard, toSuit, cardPerformance);
            moveCard(currentCard.suit, currentCard.cardIndex, toSuit);
         }

         cardPerformance.current = 1;
         setCurrentCard(drawPile.current.pop()!);
      },
      [refillDrawPile, currentCard]
   );

   // set fontWidth
   useEffect(() => {
      if (fontTestElement.current !== null && fontWidth.current === 0) {
         fontWidth.current =
            fontTestElement.current.getBoundingClientRect().width;
      }
   }, []);

   // fetch Cards & template from firestore and initialize cardSuits[0] and cardIndex
   useEffect(() => {
      const fetchCards = async () => {
         if (!deckId) {
            console.error("Error: no deckId in url");
            return;
         }

         try {
            const deck = await getDeckById(deckId);

            setTemplate(deck.template);
            setCards(deck.cards);

            console.log("fetch cards and template from firestore effected");
            // initiate category settings to all STATE.ASK
            setCategorySettings(
               deck.template.cats.reduce(
                  (acc, category) => ({
                     ...acc,
                     [category._ID]: STATE.ASK,
                  }),
                  {}
               )
            );

            if (cardSuits.current[0].size === 0) {
               // initialize suit 0
               cardSuits.current[0] = new Set(deck.cards.map((_, i) => i));
               getNextCard(true);
            }
         } catch (e) {
            console.error("Error fetching CARDS", e);
         }

         setIsPageFirstLoaded(false);
      };

      if (isPageFirstLoaded) {
         fetchCards();
      }
   }, [deckId, getNextCard, isPageFirstLoaded]);

   // Initialize inputRefs & rowStates & _dependencies & sequential
   useEffect(() => {
      if (cards) {
         const _inputRefs: Record<string, React.RefObject<HTMLInputElement>[]> =
            {};
         const _rowStates: Record<string, STATE[]> = {};

         cards[currentCard.cardIndex].cats.forEach((category) => {
            _inputRefs[category._ID] = category.rows.map(() =>
               createRef<HTMLInputElement>()
            );

            _rowStates[category._ID] = category.rows.map(() => STATE.HIDE);

            _dependencies.current[category._ID] = category.deps;
            sequential.current[category._ID] = category.seq;
         });

         inputRefs.current = _inputRefs;
         setRowStates(_rowStates);
         checkDependencies();

         setIsCardFirstLoaded(true);
      }
   }, [cards, currentCard, checkDependencies]);

   // Focus First input
   useEffect(() => {
      if (isCardFirstLoaded && cards !== null) {
         focusFirstInput();
         setIsCardFirstLoaded(false);
      }
   }, [currentCard, cards, focusNextInput, isCardFirstLoaded]);

   // global key down event listener for escape and enter
   useEffect(() => {
      const handleGlobalKeyDown = (e: KeyboardEvent) => {
         // listener for escape/settings overlay
         if (e.key === "Escape" && cards) {
            e.preventDefault();
            setIsSettings((prev) => {
               // focus first input when exit settings overlay
               setTimeout(() => {
                  focusFirstInput();
               }, 2);

               return !prev;
            });

            //listener for enter and card is done
         } else if (e.key === "Enter" && isCardDone) {
            if (isRedo) {
               redo();
               return;
            }

            getNextCard();
         }
      };

      const updateCaret = () => {
         if (!caretData.element) {
            return;
         }
         moveCaret(caretData.element);
      };

      document.addEventListener("keydown", handleGlobalKeyDown);
      window.addEventListener("scroll", updateCaret);
      window.addEventListener("resize", updateCaret);

      return () => {
         document.removeEventListener("keydown", handleGlobalKeyDown);
         window.removeEventListener("scroll", updateCaret);
         window.removeEventListener("resize", updateCaret);
      };
   });

   return (
      <>
         {cards !== null &&
         template !== null &&
         Object.keys(inputRefs.current).length !== 0 &&
         Object.keys(rowStates).length !== 0 ? (
            //
            // Input Body
            <div className={classNames(styles.InputBody)}>
               {/* Input Categories */}
               {cards[currentCard.cardIndex].cats.map(
                  (category, categoryIndex) => {
                     return (
                        <InputCategory
                           category={category}
                           inputRefs={inputRefs.current[category._ID]}
                           rowStates={rowStates[category._ID]}
                           handleOnFocus={handleOnFocus}
                           handleOnBlur={handleOnBlur}
                           handleOnClick={handleOnClick}
                           handleKeyDown={(
                              rowIndex: number,
                              event: React.KeyboardEvent<HTMLInputElement>,
                              row: CardRow
                           ) => {
                              handleOnKeyDown(
                                 category._ID,
                                 rowIndex,
                                 event,
                                 row
                              );
                           }}
                           key={`category ${categoryIndex}`}
                        />
                     );
                  }
               )}

               <button
                  onClick={() => {
                     getNextCard();
                  }}
               >
                  next Card
               </button>

               <button
                  onClick={() => {
                     console.log(rowStates, categorySettings);
                  }}
               >
                  rowStates & category settings
               </button>

               <button
                  onClick={() => {
                     console.log(cardSuits, drawPile);
                  }}
               >
                  cardsuits and drawpile
               </button>

               <button
                  onClick={() => {
                     console.log(currentCard, cardPerformance.current);
                  }}
               >
                  current card & performance
               </button>

               <div
                  className={classNames(styles.Caret)}
                  style={{
                     opacity: caretData.active ? 100 : 0,
                     top: caretData.top,
                     left: caretData.left,
                  }}
               />

               <SettingsOverlay
                  isSettings={isSettings}
                  template={template}
                  categorySettings={categorySettings}
                  changeCategorySettings={changeCategorySettings}
               />
            </div>
         ) : (
            <p>Loading...</p>
         )}

         <div style={{ display: "flex", opacity: 0 }}>
            <p ref={fontTestElement}>m</p>
         </div>
      </>
   );
}
