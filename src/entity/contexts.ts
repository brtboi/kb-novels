import { createContext } from "react";
import { Card } from "./types.ts";

interface EditContextType {
    templateRef: React.MutableRefObject<Card | null>
    cardsRef: React.MutableRefObject<Card[] | null>    
}

export const EditContext = createContext<EditContextType | null>(null)