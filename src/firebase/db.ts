import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Card, Deck } from "../entity/types";

/**
 *
 * @param {string} deckId - docId/deckId to query for
 * @returns {Promise<Deck>} - Deck representing the corresponding Deck
 * @throws {Error} - throws error if no corresponding doc found
 *
 */
export const getDeckById = async (deckId: string): Promise<Deck> => {
   const docRef = doc(db, `decks/${deckId}`);
   const docSnapshot = await getDoc(docRef);

   if (!docSnapshot.exists()) {
      throw new Error(`Deck with deckId ${deckId} not found`);
   }

   const data = docSnapshot.data();

   return {
      id: deckId,
      name: data.name,
      template: JSON.parse(data.template),
      cards: JSON.parse(data.cards),
   };
};

export const createDeck = async (docContent?: Deck): Promise<string> => {
   const document = docContent
      ? {
           name: docContent.name,
           template: docContent.template,
           cards: docContent.cards,
        }
      : {
           name: "new deck",
           template: JSON.stringify({ cats: [] }),
           cards: JSON.stringify([]),
        };

        console.log("document: ", document)

   const docRef = await addDoc(collection(db, "decks"), {...document});

   console.log("Doc created successfully with ID:", docRef.id);
   return docRef.id;
};

// export const createDeck = async (name: string, template: Card, cards: Card[]) => {
//    try {
//       const docRef = await addDoc(collection(db, "decks"), {
//          name: name,
//          template: template,
//          cards: cards,
//       });

//       console.log("Doc created successfully with ID:", docRef.id);
//    } catch (error) {
//       console.error("Error saving deck to db:", error);
//    }
// };

/**
 * Test deck:
 * [{"Author":{"Author":["George Orwell","Orwell"]},"Protagonist":{"Protagonist":["Winston Smith"]},"Title":{"Title":["1984"]}},{"Protagonist":{"Protagonist":["Victor Frankenstein"]},"Title":{"Title":["Frankenstein"]},"Author":{"Author":["Mary Shelley","Shelley"]}}]
 *
 *
 * [{"Title":{"Title":["1984"]},"Author":{"Author":["George Orwell","Orwell"]},"Protagonist":{"Protagonist":["Winston Smith"]}},{"Author":{"Author":["Mary Shelley","Shelley"]},"Protagonist":{"Protagonist":["Victor Frankenstein"]},"Title":{"Title":["Frankenstein"]}}]
 */
