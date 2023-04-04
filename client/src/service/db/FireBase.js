import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBAif9FN_45KcB9s7jNCO07Jab3Qvwi4B0",
  authDomain: "diagnostify.firebaseapp.com",
  projectId: "diagnostify",
  storageBucket: "diagnostify.appspot.com",
  messagingSenderId: "861764799531",
  appId: "1:861764799531:web:52d887b350be500ac46e6e",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;
