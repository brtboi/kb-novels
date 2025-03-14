import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { Deck } from "../entity/types";
import { Link, useNavigate } from "react-router-dom";
import styles from "./homePageStyles.module.scss";
import classNames from "classnames";
import { ReactComponent as EditIcon } from "../assets/Icons/Edit.svg";
import { ReactComponent as DuplicateIcon } from "../assets/Icons/Duplicate.svg";
import { createDeck } from "../firebase/db";

export default function HomePage() {
   const navigate = useNavigate();

   const [allDecks, setAllDecks] = useState<Deck[]>([]);
   const [isLoading, setIsLoading] = useState<boolean>(true);

   const handleNewDeck = async () => {
      try {
         const docId = await createDeck();
         navigate(`/edit/${docId}`);
      } catch (error) {
         console.error("Error: couldn't create new document");
         window.alert(
            "Error creating new deck try again later maybe idk ¯\\_(ツ)_/¯"
         );
      }
   };

   const duplicateDeck = async (deck: Deck) => {
      createDeck({
         id: "",
         name: `${deck.name} (Copy)`,
         template: deck.template,
         cards: deck.cards,
      });
   };

   // listens for updates to db decklist
   useEffect(() => {
      const unsubscribe = onSnapshot(
         collection(db, "decks"),
         (snapshot) => {
            setAllDecks(
               snapshot.docs.map((doc) => ({
                  ...(doc.data() as Deck),
                  id: doc.id,
               }))
            );
            setIsLoading(false);
         },
         (error) => {
            console.error("Error fetching all Decks,", error);
         }
      );

      return () => unsubscribe();
   }, []);

   return (
      <>
         {isLoading ? (
            <p>Loading...</p>
         ) : (
            <div className={styles.HomePageDiv}>
               {allDecks.map((deck) => (
                  <div className={classNames(styles.HomePageRow)} key={deck.id}>
                     {/* Deck Link */}
                     <button
                        onClick={() => {
                           navigate(`/deck/${deck.id}`);
                        }}
                        className={styles.DeckLink}
                        style={{ flex: 1 }}
                     >{`${deck.id}: ${deck.name}`}</button>

                     {/* Row Buttons */}
                     <div>
                        {/* Duplicate Button */}
                        <button
                           onClick={() => {
                              duplicateDeck(deck);
                           }}
                           className={styles.DeckLink}
                        >
                           <DuplicateIcon />
                        </button>

                        {/* Edit Button */}
                        <button
                           onClick={() => {
                              navigate(`edit/${deck.id}`);
                           }}
                           className={styles.DeckLink}
                        >
                           <EditIcon />
                        </button>
                     </div>
                  </div>
               ))}
               <div className={styles.HomePageRow}>
                  <button onClick={handleNewDeck} className={styles.DeckLink}>
                     New Deck
                  </button>
               </div>
               <Link to={`/test`} className={styles.DeckLink}>
                  Test page
               </Link>
            </div>
         )}
      </>
   );
}
