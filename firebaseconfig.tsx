// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getDatabase } from "firebase/database";

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseconfig = {
  apiKey: "AIzaSyDqxuTg9bByn6NC7fL54UtbIhodUh-zad0",
  authDomain: "data-base-aee61.firebaseapp.com",
  databaseURL: "https://data-base-aee61-default-rtdb.firebaseio.com",
  projectId: "data-base-aee61",
  storageBucket: "data-base-aee61.firebasestorage.app",
  messagingSenderId: "529801136052",
  appId: "1:529801136052:web:2b7c3d8a4615d3f687d4e1",
  measurementId: "G-1TLT6LYZKQ"
};

const app = initializeApp(firebaseconfig);
export const auth = getAuth(app);
export const db = getDatabase(app);