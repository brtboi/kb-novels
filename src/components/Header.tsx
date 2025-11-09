import React from "react";
import { Link, Outlet } from "react-router-dom";
import styles from "./homePageStyles.module.scss";
import { logOut, useAuth } from "../firebase/auth";

export default function Header() {
   const user = useAuth();

   return (
      <div>
         <Link to="/" className={styles.Header}>
            <h1>kb novels</h1>

            {user ? (
               <div>
                  <span>Welcome, {user.email}</span>
                  &nbsp;
                  <button onClick={logOut}>Logout</button>
               </div>
            ) : (
               <Link to="/login">Login</Link>
            )}
         </Link>
         <Outlet />
      </div>
   );
}
