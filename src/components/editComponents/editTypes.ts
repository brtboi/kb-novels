export type TemplateCategory = {
    _dependencies: string[];
    _isOrdered: boolean;
    _isSequential: boolean;
    name: string;
    rows: {
        label: string;
        _type: "string" | "number";
        _isCaseSensitive: boolean;
    }[];
};

export type TemplateCard = {

    categories: TemplateCategory[]
};

// export type Card = {
//     [key: string]: {
//         _dependencies: string[];
//         _isOrdered: boolean;
//         _isSequential: boolean;
//         rows: {
//             label: string;
//             answer: string;
//             _type: "string" | "number";
//             _isCaseSensitive: boolean;
//         }[];
//     }
// }