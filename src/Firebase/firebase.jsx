import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCGjlkJqm9FZ_2xM-T9Zbm_86ecJkvGJlE",
  authDomain: "wavely-host.firebaseapp.com",
  projectId: "wavely-host",
  storageBucket: "wavely-host.appspot.com",
  messagingSenderId: "200854277251",
  appId: "1:200854277251:web:e000d928bf512d83451fb6",
  measurementId: "G-569WT5FKTS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app, "gs://wavely-host.firebasestorage.app");

export { auth, db, storage };