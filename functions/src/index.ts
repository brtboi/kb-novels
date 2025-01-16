import * as admin from "firebase-admin";
import { onDocumentCreated } from "firebase-functions/v2/firestore";

admin.initializeApp();

const db = admin.firestore();

exports.onDeckAdded = onDocumentCreated("decks/{dockId}", async (event) => {
   
   const deckId = event.params.dockId;

   // Reference to the "deckList" document
   const deckListRef = db.collection("deckList").doc("WIOFZaBj3AItl6X7DFCb");

   try {
      // Start a Firestore transaction
      await db.runTransaction(async (transaction) => {
         const deckListDoc = await transaction.get(deckListRef);

         // If the document doesn't exist, initialize the deckList array
         if (!deckListDoc.exists) {
            transaction.set(deckListRef, { deckList: [deckId] });
         } else {
            // Get the current array of deckIds
            const currentDeckList = deckListDoc.data()?.deckList || [];

            // Only append if the deckId is not already in the list
            if (!currentDeckList.includes(deckId)) {
               transaction.update(deckListRef, {
                  deckList: admin.firestore.FieldValue.arrayUnion(deckId),
               });
            }
         }
      });

      console.log(`Successfully added deckId ${deckId} to deckList.`);
   } catch (error) {
      console.error("Error updating deckList:", error);
   }
});
