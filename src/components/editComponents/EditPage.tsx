import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../../entity/types";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import EditCard from "./EditCard";
import classNames from "classnames";
import styles from "./editStyles.module.scss";
import {
   DragDropContext,
   Draggable,
   Droppable,
   DropResult,
} from "@hello-pangea/dnd";
import EditCardsHeader from "./EditCardsHeader";
import { getDeckById } from "../../firebase/db";

export default function EditPage() {
   const navigate = useNavigate();

   const { deckId } = useParams<{ deckId: string }>();

   const [deckName, setDeckName] = useState<string | null>(null);
   const [templateCard, setTemplateCard] = useState<Card | null>(null);
   const [cards, setCards] = useState<Card[] | null>(null);

   const [isTemplateCollapsed, setIsTemplateCollapsed] =
      useState<boolean>(false);
   const [isCardsCollapsed, setIsCardsCollapsed] = useState<boolean[]>([]);

   const toggleIsCollapsed = (index: number) => {
      setIsCardsCollapsed((prev) => prev.map((e, i) => (i === index ? !e : e)));
   };

   const toggleIsCollapsedAll = (isCollapsed: boolean) => {
      setIsCardsCollapsed((prev) => prev.map(() => isCollapsed));
   };

   const handleSaveDeck = async () => {
      if (deckId === "new") {
         try {
            const docRef = await addDoc(collection(db, "decks"), {
               name: deckName,
               template: JSON.stringify(templateCard),
               cards: JSON.stringify(cards),
            });

            console.log("Doc created successfully with ID:", docRef.id);
         } catch (error) {
            console.error("Error saving deck to db:", error);
         }
      } else {
         const docRef = doc(db, `decks/${deckId}`);
         try {
            await setDoc(
               docRef,
               {
                  name: deckName,
                  template: JSON.stringify(templateCard),
                  cards: JSON.stringify(cards),
               },
               { merge: true }
            );

            console.log("Doc successfully saved");
         } catch (error) {
            console.error("Error saving deck to db:", error);
         }
      }
   };

   const updateTemplateCard = (newCard: Card) => {
      setTemplateCard(newCard);
   };

   const updateCard = (cardIndex: number, newCard: Card) => {
      setCards((prev) => {
         const updatedCards = structuredClone(prev!);
         updatedCards[cardIndex] = newCard;
         return updatedCards;
      });
   };

   const addCard = () => {
      const newCard: Card = structuredClone(templateCard!);
      setCards((prev) => [...prev!, newCard]);
      setIsCardsCollapsed((prev) => [...prev, false]);
   };

   const deleteCard = (index: number) => {
      setCards((prev) => {
         const updatedCards = structuredClone(prev!);
         updatedCards.splice(index, 1);
         return updatedCards;
      });

      setIsCardsCollapsed((prev) => {
         const _prev = structuredClone(prev);
         _prev.splice(index, 1);
         return _prev;
      });
   };

   const handleCardsDragEnd = (result: DropResult<string>) => {
      const { destination, source } = result;

      if (!destination) return; // Dropped outside a valid destination
      if (destination.index === source.index) return; // No change in position

      setCards((prev) => {
         const updatedCards = structuredClone(prev!);
         const [movedCard] = updatedCards.splice(source.index, 1);
         updatedCards.splice(destination.index, 0, movedCard);
         return updatedCards;
      });

      setIsCardsCollapsed((prev) => {
         const _prev = structuredClone(prev);
         const [movedCard] = _prev.splice(source.index, 1);
         _prev.splice(destination.index, 0, movedCard);
         return _prev;
      });
   };

   // fetch cards
   useEffect(() => {
      const fetchCards = async () => {
         if (!deckId) {
            console.error("Error: no deckId in URL");
            return;
         }

         try {
            const deck = await getDeckById(deckId);

            setDeckName(deck.name);
            setTemplateCard(deck.template);
            setCards(deck.cards);
            setIsCardsCollapsed(deck.cards.map(() => false));
         } catch (e) {
            console.error("Error fetching CARDS", e);
         }
      };

      if (deckId === "new") {
         setDeckName("");
         setTemplateCard({ cats: [] });
         setCards([]);
      } else {
         fetchCards();
      }
   }, [deckId]);

   return (
      <>
         {deckName !== null && templateCard !== null && cards !== null ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
               <p>
                  Deck Name:
                  <input
                     className={classNames(styles.Input)}
                     value={deckName}
                     onChange={(e) => {
                        setDeckName(e.target.value);
                     }}
                  />
               </p>

               {/* Template Card */}
               <EditCard
                  card={templateCard}
                  cardIndex={0}
                  updateCard={updateTemplateCard}
                  isTemplate={true}
                  isCollapsed={isTemplateCollapsed}
                  toggleIsCollapsed={() => {
                     setIsTemplateCollapsed((prev) => !prev);
                  }}
               />

               <EditCardsHeader
                  template={templateCard}
                  setCards={setCards}
                  toggleIsCollapsedAll={toggleIsCollapsedAll}
               />

               <DragDropContext onDragEnd={handleCardsDragEnd}>
                  <Droppable droppableId="CardsDroppable">
                     {(provided) => (
                        <div
                           {...provided.droppableProps}
                           ref={provided.innerRef}
                        >
                           {cards.map((card, cardIndex) => (
                              <Draggable
                                 index={cardIndex}
                                 draggableId={`Card ${cardIndex}`}
                                 key={`Card ${cardIndex}`}
                              >
                                 {(provided) => (
                                    <div
                                       {...provided.draggableProps}
                                       ref={provided.innerRef}
                                    >
                                       <EditCard
                                          card={card}
                                          cardIndex={cardIndex}
                                          updateCard={(newCard: Card) => {
                                             updateCard(cardIndex, newCard);
                                          }}
                                          deleteCard={() => {
                                             deleteCard(cardIndex);
                                          }}
                                          template={templateCard}
                                          isTemplate={false}
                                          isCollapsed={
                                             isCardsCollapsed[cardIndex]
                                          }
                                          toggleIsCollapsed={() => {
                                             toggleIsCollapsed(cardIndex);
                                          }}
                                          dragHandleProps={
                                             provided.dragHandleProps
                                          }
                                          key={`card ${cardIndex}`}
                                       />
                                    </div>
                                 )}
                              </Draggable>
                           ))}
                           {provided.placeholder}
                        </div>
                     )}
                  </Droppable>
               </DragDropContext>

               <button onClick={addCard}>add Card</button>
               <button
                  onClick={() => {
                     console.log(templateCard);
                  }}
               >
                  print template
               </button>
               <button
                  onClick={() => {
                     console.log(cards);
                  }}
               >
                  print cards
               </button>
               <button onClick={handleSaveDeck}>Save Deck</button>
               <button
                  onClick={() => {
                     navigate(-1);
                  }}
               >
                  back
               </button>
            </div>
         ) : (
            <p>loading...</p>
         )}
      </>
   );
}
