import {
    DragDropContext,
    Draggable,
    Droppable,
    DropResult,
} from "@hello-pangea/dnd";
import { useEffect, useState } from "react";
import { Card } from "../entity/types";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

export default function TestPage() {
    const [cards, setCards] = useState<Card[] | null>(null);

    const [items, setItems] = useState([
        { id: "1", content: "Item 1" },
        { id: "2", content: "Item 2" },
        { id: "3", content: "Item 3" },
    ]);

    const handleDragEnd = (result: DropResult<string>) => {
        const { destination, source } = result;

        if (!destination) return; // Dropped outside a valid destination
        if (destination.index === source.index) return; // No change in position

        setCards((prev) => {
            const updatedCards = structuredClone(prev!);
            const [movedCard] = updatedCards.splice(source.index, 1);
            updatedCards?.splice(destination.index, 0, movedCard);
            return updatedCards;
        });
    };


    useEffect(() => {
        const fetchCards = async () => {
            try {
                const docSnapshot = await getDoc(
                    doc(db, `decks/XL6SUiH6eqN8pfunhGpG`)
                );
                const data = docSnapshot.data();

                setCards(JSON.parse(data?.cards));
            } catch (e) {
                console.error("Error fetching CARDS", e);
            }
        };

        fetchCards();
    }, []);

    return (
        <>
            {cards === null ? (
                <p>loading...</p>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="droppableCard">
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                {cards.map((card, cardIndex) => (
                                    <Draggable
                                        index={cardIndex}
                                        draggableId={`card ${cardIndex}`}
                                        key={`card ${cardIndex}`}
                                    >
                                        {(provided) => (
                                            <div
                                                {...provided.draggableProps}
                                                ref={provided.innerRef}
                                            >
                                                <span
                                                    {...provided.dragHandleProps}
                                                >
                                                    -
                                                </span>
                                                {card.categories.map(
                                                    (category) => (
                                                        <div>{category.name}</div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {/* {items.map((item, index) => (
                                <Draggable
                                    key={item.id}
                                    draggableId={item.id}
                                    index={index}
                                >
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                        >
                                            <span {...provided.dragHandleProps}>
                                                drag
                                            </span>
                                            {item.content}
                                        </div>
                                    )}
                                </Draggable>
                            ))} */}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            )}
        </>
    );
}
