import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCVmu9yqdJ7jTdF2-INpR3o_pGHeoicOb0",
  authDomain: "vel-projects.firebaseapp.com",
  projectId: "vel-projects",
  storageBucket: "vel-projects.firebasestorage.app",
  messagingSenderId: "506315234291",
  appId: "1:506315234291:web:baa83cb1081deb536b9086"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);