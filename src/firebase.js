// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// PASTE MILIKMU DI SINI:
const firebaseConfig = {
    apiKey: "AIzaSyCDq2k9i5BLB5axx5g47TCyrsrpwLQf9Jw",
    authDomain: "puskesmas-auth-ebcd8.firebaseapp.com",
    projectId: "puskesmas-auth-ebcd8",
    storageBucket: "puskesmas-auth-ebcd8.firebasestorage.app",
    messagingSenderId: "447307209339",
    appId: "1:447307209339:web:02db529fe0fadf043920de"
};


// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Export layanan yang akan kita pakai di halaman Login nanti
export const auth = getAuth(app);
export const db = getFirestore(app);