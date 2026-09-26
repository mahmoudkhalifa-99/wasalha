
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './pages/App';
import './styles/index.css';

// تسجيل الـ Service Worker للإشعارات بطريقة تضمن البقاء داخل نفس النطاق
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // بناء المسار بشكل صريح ليكون متوافقاً مع مكان وجود الصفحة الحالية
    // نستخدم location.origin و location.pathname لضمان أن المسار يبدأ بنفس بروتوكول ونطاق الصفحة الحالية
    const currentPath = window.location.pathname;
    const directory = currentPath.substring(0, currentPath.lastIndexOf('/')) || '';
    const swUrl = `${window.location.origin}${directory}/firebase-messaging-sw.js`.replace(/\/+/g, '/').replace(':/', '://');

    navigator.serviceWorker.register(swUrl)
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((err) => {
        console.error('Service Worker registration failed:', err);
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
