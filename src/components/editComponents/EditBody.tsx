import { useState } from "react";
import { Card } from "../../entity/types";
import { TemplateCard } from "./editTypes";
import EditTemplate from "./EditTemplate";
import { useNavigate } from "react-router-dom";



export default function EditBody() {
    const navigate = useNavigate()

    return <><EditTemplate/><button onClick={() => {navigate(-1)}}>back</button></>

}