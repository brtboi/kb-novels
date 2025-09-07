import React from "react";
import { useNavigate } from "react-router-dom";

export default function HelpPage() {
   const navigate = useNavigate();

   return (
      <>
         <p>
            Hey this is a very last minute help page because this website lowkey
            doens&apos;t make any sense without an explaination (myb)
         </p>
         <p>
            the basic premise of this website is to help you study for complex
            stuff where the simple term-definition structure might not cut it
            (for example, the author, characters, plot, settings of novels)
         </p>
         <p>
            So on the home page, you&apos;ll find a list of every
            &quot;deck&quot; and each deck is made up of a bunch of cards (like
            different novels you&apos;re trying to memorize for example)
         </p>
         <p>
            After selecting a deck, click &quot;settings&quot; or press [esc] to
            pull up settings, where you can select which &quot;category&quot;
            you want to show/hide/or be prompted for
         </p>
         <p>
            type &quot;idk&quot; if you want the answer to be shown and you can
            navigate between answer boxes with arrow keys and enter to check
            answer
         </p>
         <p>
            once all the answer boxes are filled and submitted, press enter once
            again to move on to the next card
         </p>
         <button
            onClick={() => {
               navigate(-1);
            }}
         >
            <u>back</u>
         </button>
      </>
   );
}
