import {
   createUserWithEmailAndPassword,
   onAuthStateChanged,
   signInWithEmailAndPassword,
   signOut,
   User,
} from "firebase/auth";
import { auth } from "./firebase.ts";
import { useEffect, useState } from "react";

export const signUp = async (email: string, password: string) => {
   try {
      const userCredential = await createUserWithEmailAndPassword(
         auth,
         email,
         password
      );
      console.log("User signed up with email:", userCredential.user.email);
      return userCredential;
   } catch (error) {
      console.error("Error signing up:", error);
      throw error;
   }
};

export const logIn = async (email: string, password: string) => {
   try {
      const userCredential = await signInWithEmailAndPassword(
         auth,
         email,
         password
      );
      console.log("User logged in with email:", userCredential.user.email);
      return userCredential;
   } catch (error) {
      console.error("Error logging in:", error);
      throw error;
   }
};

export const logOut = () => signOut(auth);

export function useAuth() {
   const [user, setUser] = useState<User | null>(null);
   useEffect(() => onAuthStateChanged(auth, setUser), []);
   return user;
}
