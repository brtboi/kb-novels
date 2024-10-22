import { useContext, useState } from "react";
import { EditContext } from "../../entity/contexts";
import EditCardsCard from "./EditCardsCard";

export default function EditCardsBody() {
    const { templateRef, cardsRef } = useContext(EditContext)!;

    const [_, setUpdate] = useState<number>(0);

    const handleAddCard = () => {
        cardsRef.current!.push(structuredClone(templateRef.current!));

        setUpdate((prev) => prev + 1);
    };

    return (
        <div>
            {cardsRef.current!.map((_, cardIndex) => (
                <EditCardsCard
                    cardIndex={cardIndex}
                    key={`card ${cardIndex}`}
                />
            ))}
            <button onClick={handleAddCard}>add card</button>
        </div>
    );
}
