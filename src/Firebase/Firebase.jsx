// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7ZyBnwuNWKf8ooUPkKDUKl1n8rnQ-R4w",
  authDomain: "proyecto-final-50e04.firebaseapp.com",
  projectId: "proyecto-final-50e04",
  storageBucket: "proyecto-final-50e04.firebasestorage.app",
  messagingSenderId: "219499975200",
  appId: "1:219499975200:web:ffb9860716e326b5196245"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);