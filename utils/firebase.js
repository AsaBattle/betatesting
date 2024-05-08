import firebase from 'firebase/app';
import 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCIZJYgR0ymRcbP8oKrtcAjPsYrh3SBcMY",
    authDomain: "fulljourneyai.firebaseapp.com",
    projectId: "fulljourneyai",
    storageBucket: "fulljourneyai.appspot.com",
    messagingSenderId: "377579543667",
    appId: "1:377579543667:web:e8d7b1e1c4f23e0360de06",
    measurementId: "G-W35RZYT99C"
  };
  
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // if already initialized, use that one
}

export default firebase;