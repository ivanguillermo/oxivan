importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyCaYC1twuL7Ibtr6fU3eT6MAlJsQAu2H3o",
    authDomain: "oxivan-b6492.firebaseapp.com",
    projectId: "oxivan-b6492",
    storageBucket: "oxivan-b6492.firebasestorage.app",
    messagingSenderId: "265161051279",
    appId: "1:265161051279:web:23f2c7c95155aed4a374fa",
    measurementId: "G-9NY3MFDKG6"
  };

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || './assets/oxivan_logo.jpg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
