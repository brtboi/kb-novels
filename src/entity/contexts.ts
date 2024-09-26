import { createContext } from "react";
import { Card, InputNodeList } from "./types.ts";

interface CARDSContextType {
    CARDSArr: Card[];
    CARDSIndex: number;
    setCARDSIndex: React.Dispatch<React.SetStateAction<number>>;
}

export const CARDSContext = createContext<CARDSContextType | null>(null);

interface InputContextType {
    inputNodeListRef: React.MutableRefObject<InputNodeList>;
}

export const InputContext = createContext<InputContextType | null>(null);
