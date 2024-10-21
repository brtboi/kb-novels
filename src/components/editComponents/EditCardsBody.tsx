import { useContext } from "react";
import { EditContext } from "../../entity/contexts";
import EditCardsCard from "./EditCardsCard";

export default function EditCardsBody() {
    const { templateRef, cardsRef, rerender } = useContext(EditContext)!;

    const handleAddCard = () => {
        cardsRef.current!.push({ ...templateRef.current! });

        rerender();
    };

    return (
        <div>
            {cardsRef.current!.map((_, cardIndex) => (
                <EditCardsCard cardIndex={cardIndex} key={`card ${cardIndex}`}/>
            ))}
            <button onClick={handleAddCard}>add card</button>
        </div>
    );
}
