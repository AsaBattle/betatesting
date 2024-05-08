// Firebase 9+ uses a new modular approach
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCIZJYgR0ymRcbP8oKrtcAjPsYrh3SBcMY",
    authDomain: "fulljourneyai.firebaseapp.com",
    projectId: "fulljourneyai",
    storageBucket: "fulljourneyai.appspot.com",
    messagingSenderId: "377579543667",
    appId: "1:377579543667:web:e8d7b1e1c4f23e0360de06",
    measurementId: "G-W35RZYT99C"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  
  export { auth };