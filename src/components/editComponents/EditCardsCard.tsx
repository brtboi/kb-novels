import { useContext, useState } from "react";
import { EditContext } from "../../entity/contexts";
import { Card } from "../../entity/types";
import EditCardsCategory from "./EditCardsCategory";

interface Props {
    cardIndex: number;
}

export default function EditCardsCard({ cardIndex }: Props) {
    const { cardsRef } = useContext(EditContext)!;

    return (
        <>
            {cardsRef.current![cardIndex].categories.map((_, categoryIndex) => (
                <EditCardsCategory cardIndex={cardIndex} categoryIndex={categoryIndex} key={`category ${categoryIndex}`}/>
            ))}
        </>
    );
}
