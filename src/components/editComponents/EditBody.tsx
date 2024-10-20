import { useContext } from "react";
import EditTemplate from "./EditTemplate";
import { useNavigate } from "react-router-dom";
import { EditContext } from "../../entity/contexts";

export default function EditBody() {
    const { templateRef } = useContext(EditContext)!;
    const navigate = useNavigate();

    return (
        <>
            <EditTemplate />
            <div style={{ width: "10rem",display: "flex", flexDirection: "column" }}>
                <button
                    onClick={() => {
                        console.log(templateRef.current);
                    }}
                >
                    print template
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
