import { useContext } from "react";
import EditTemplateBody from "./EditTemplateBody";
import { useNavigate } from "react-router-dom";
import { EditContext } from "../../entity/contexts";
import EditCardsBody from "./EditCardsBody";

export default function EditBody() {
    const { templateRef, cardsRef } = useContext(EditContext)!;
    const navigate = useNavigate();

    return (
        <>
            <EditTemplateBody />
            <EditCardsBody />
            <div
                style={{
                    width: "10rem",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <button
                    onClick={() => {
                        console.log(templateRef.current);
                    }}
                >
                    print template
                </button>
                <button
                    onClick={() => {
                        console.log(cardsRef.current);
                    }}
                >
                    print cards
                </button>
                <button
                    onClick={() => {
                        navigate(-1);
                    }}
                >
                    back
                </button>
            </div>
        </>
    );
}
