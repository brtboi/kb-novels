import { createContext } from "react";
import { Card } from "./types.ts";

interface CARDSContextType {
    CARDSArr: Card[];
    CARDSIndex: number;
    setCARDSIndex: (value: number) => void;
}

export const CARDSContext = createContext<CARDSContextType>({
    CARDSArr: [],
    CARDSIndex: 0,
    setCARDSIndex: () => {},
});
