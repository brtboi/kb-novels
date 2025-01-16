import React from "react";
import { Link, Outlet } from "react-router-dom";
import styles from "./homePageStyles.module.scss";

export default function Header() {
   return (
      <div>
         <Link to="/" className={styles.Header}>
            <h1>kb novels</h1>
         </Link>
         <Outlet />
      </div>
   );
}
