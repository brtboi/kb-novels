import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { Deck } from "../entity/types";
import { Link, useNavigate } from "react-router-dom";
import styles from "./homePageStyles.module.scss";
import classNames from "classnames";
import { ReactComponent as EditIcon } from "../assets/Icons/Edit.svg";
import { ReactComponent as DuplicateIcon } from "../assets/Icons/Duplicate.svg";

export default function HomePage() {
   const navigate = useNavigate();

   const [allDecks, setAllDecks] = useState<Deck[]>([]);
   const [isLoading, setIsLoading] = useState<boolean>(true);

   useEffect(() => {
      const fetchAllDecks = async () => {
         const querySnapshot = await getDocs(collection(db, "decks"));
         setAllDecks(
            querySnapshot.docs.map((doc) => {
               return {
                  ...(doc.data() as Deck),
                  id: doc.id,
               };
            })
         );
      };

      fetchAllDecks()
         .then(() => {
            setIsLoading(false);
         })
         .catch((e) => {
            console.error("Error fetching all decks", e);
         });
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

                     {/* Home Row Buttons */}
                     <div>
                        <button className={styles.DeckLink}>
                           <DuplicateIcon />
                        </button>

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
                  <button
                     onClick={() => {
                        navigate(`/edit/new`);
                     }}
                     className={styles.DeckLink}
                  >
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
