import { createContext } from "react";
import { InputNodeList } from "./types.ts";

// interface CARDSContextType {
//     CARDSArr: Card[];
// }

// export const CARDSContext = createContext<CARDSContextType | null>(null);

interface InputContextType {
    inputNodeListRef: React.MutableRefObject<InputNodeList>;
}

export const InputContext = createContext<InputContextType | null>(null);
