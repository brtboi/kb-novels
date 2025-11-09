import React, { useState } from "react";
import { logIn, signUp, useAuth } from "../../firebase/auth";
import styles from "./loginStyles.module.scss";
import { AuthError } from "firebase/auth";
// import { useNavigate } from "react-router-dom";

export default function LoginPage() {
   const user = useAuth();
   // const navigate = useNavigate();
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [error, setError] = useState<string | null>(null);

   const onSignUpClick = async () => {
      try {
         await signUp(email, password);
      } catch (error) {
         setError((error as AuthError).code);
      }
   };

   const onLoginClick = async () => {
      try {
         await logIn(email, password);
      } catch (error) {
         setError((error as AuthError).code);
      }
   };

   return (
      <div>
         <h2>Login Page</h2>
         {user ? (
            <p>You are logged in as {user.email}</p>
         ) : (
            <div className={styles.LoginContainer}>
               <input
                  type="text"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
               />
               <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
               />
               <button onClick={onSignUpClick}>Sign Up</button>
               <button onClick={onLoginClick}>Log In</button>
               <p>{error}</p>
            </div>
         )}
      </div>
   );
}
