import { createContext } from "react";
import { Card, InputNodeList, TemplateCard } from "./types.ts";

interface InputContextType {
    inputNodeListRef: React.MutableRefObject<InputNodeList>;
}

export const InputContext = createContext<InputContextType | null>(null);


interface EditContextType {
    templateRef: React.MutableRefObject<TemplateCard | null>
    cardsRef: React.MutableRefObject<Card[] | null>
    rerender: () => void;
    
}

export const EditContext = createContext<EditContextType | null>(null)