import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Deck } from "../entity/types";

/**
 *
 * @param {string} deckId - docId/deckId to query for
 * @returns {Promise<Deck>} - Deck representing the corresponding Deck
 * @throws {Error} - throws error if no corresponding doc found
 *
 */
export const deckById = async (deckId: string): Promise<Deck> => {
    const docRef = doc(db, `decks/${deckId}`);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
        throw new Error(`Deck with deckId ${deckId} not found`);
    }

    const data = docSnapshot.data();

    return {
        id: deckId,
        name: data.name,
        CARDSArr: data.CARDSArr,
    };
};

/**
 * Test deck:
 * [{"Author":{"Author":["George Orwell","Orwell"]},"Protagonist":{"Protagonist":["Winston Smith"]},"Title":{"Title":["1984"]}},{"Protagonist":{"Protagonist":["Victor Frankenstein"]},"Title":{"Title":["Frankenstein"]},"Author":{"Author":["Mary Shelley","Shelley"]}}]
 * 
 * 
 * [{"Title":{"Title":["1984"]},"Author":{"Author":["George Orwell","Orwell"]},"Protagonist":{"Protagonist":["Winston Smith"]}},{"Author":{"Author":["Mary Shelley","Shelley"]},"Protagonist":{"Protagonist":["Victor Frankenstein"]},"Title":{"Title":["Frankenstein"]}}]
 */
