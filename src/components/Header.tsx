import classNames from "classnames";
import React from "react";
import { Outlet } from "react-router-dom";

export default function Header() {
    return (
        <>
            <a href="/" className={classNames()}><h1>kb novels</h1></a>
            <Outlet />
        </>
    );
}
