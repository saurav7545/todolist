// Firebase App (the core Firebase SDK) is always required and must be listed first
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFiqBif2SgNHYJKKGBxwIII-iKwlcVTWw",
  authDomain: "indiantodolist-400ca.firebaseapp.com",
  projectId: "indiantodolist-400ca",
  storageBucket: "indiantodolist-400ca.appspot.com",
  messagingSenderId: "1084021192183",
  appId: "1:1084021192183:web:8f89f3ec2be5352374aaf2",
  measurementId: "G-S123MVWKVK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db }; 