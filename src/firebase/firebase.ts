// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDQqSs_56k19mu1A-_hsBM5l0QIn-U1UP0",
  authDomain: "kb-novels.firebaseapp.com",
  projectId: "kb-novels",
  storageBucket: "kb-novels.appspot.com",
  messagingSenderId: "1039235926646",
  appId: "1:1039235926646:web:089cc7932733a75be6ad57",
  measurementId: "G-8BRF782T3G"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
// export const analytics = getAnalytics(app);