
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { initializeFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDlfpN0JCsmpCKdTyb4ZX_QN0sZbypIv48",
  authDomain: "sada-51292.firebaseapp.com",
  databaseURL: "https://sada-51292-default-rtdb.firebaseio.com",
  projectId: "sada-51292",
  storageBucket: "sada-51292.firebasestorage.app",
  messagingSenderId: "821734316791",
  appId: "1:821734316791:web:a41030678e2ecaa168d1f2",
  measurementId: "G-XZMSDBYW43"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// إعداد Firestore ليكون أكثر استقراراً في البيئات محدودة الشبكة
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // فرض الـ Long Polling لحل مشاكل الـ WebSockets
  useFetchStreams: false,
  ignoreUndefinedProperties: true
});

export default app;
