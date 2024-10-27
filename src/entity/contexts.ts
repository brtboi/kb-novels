import { createContext } from "react";
import { Card, InputNodeList } from "./types.ts";

interface InputContextType {
    inputNodeListRef: React.MutableRefObject<InputNodeList>;
}

export const InputContext = createContext<InputContextType | null>(null);


interface EditContextType {
    templateRef: React.MutableRefObject<Card | null>
    cardsRef: React.MutableRefObject<Card[] | null>    
}

export const EditContext = createContext<EditContextType | null>(null)