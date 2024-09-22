import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Deck } from "../entity/types";

/**
 *
 * @param {string} id - docId/deckId to query for
 * @returns {Promise<Deck>} - Deck representing the corresponding Deck
 * @throws {Error} - throws error if no corresponding doc found
 *
 */
export const deckById = async (id: string): Promise<Deck> => {
    const docRef = doc(db, `decks/${id}`);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
        throw new Error(`Deck with id ${id} not found`);
    }

    const data = docSnapshot.data();

    return {
        id: id,
        name: data.name,
        CARDSArr: data.CARDSArr,
    };
};

/**
 * Test deck:
 * [{"Title":{"Title":["The Iliad"]},"Protagonist":{"Protagonist":["Achilles"]},"Author":{"Author":["Homer"]}},{"Protagonist":{"Protagonist":["Odysseus"]},"Title":{"Title":["The Odyssey"]},"Author":{"Author":["Homer"]}},{"Author":{"Author":["George Orwell","Orwell"]},"Protagonist":{"Protagonist":["Winston Smith"]},"Title":{"Title":["1984"]}},{"Protagonist":{"Protagonist":["Victor Frankenstein"]},"Title":{"Title":["Frankenstein"]},"Author":{"Author":["Mary Shelley","Shelley"]}}]
 */
