import React from "react";
import { Outlet } from "react-router-dom";

export default function Header() {
    return (
        <>
            <h1>kb novels</h1>
            <Outlet />
        </>
    );
}
