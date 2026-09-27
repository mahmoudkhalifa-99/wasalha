
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import App from './pages/App';
import './styles/index.css';
// تحميل تنسيقات خرائط Leaflet من الحزمة المثبّتة محلياً بدل تحميلها من
// unpkg.com عبر الإنترنت. كانت التنسيقات بتتحمّل من CDN خارجي، فلو حصل أي
// بطء أو انقطاع في الشبكة وقت فتح التطبيق كانت الخريطة بتظهر بلاطات متكسرة
// وغير منسقة. تحميلها هنا يضمن إنها تتحمّل دايماً مع باقي كود التطبيق.
import 'leaflet/dist/leaflet.css';

// تهيئة تسجيل الدخول بجوجل. على الويب بتحمّل مكتبة جوجل، وعلى تطبيق
// الأندرويد بتقرأ الإعدادات (serverClientId) من capacitor.config.ts.
GoogleAuth.initialize().catch((err) => console.warn('GoogleAuth init failed:', err));

// تسجيل الـ Service Worker لإشعارات الويب فقط، مش مطلوب جوه تطبيق الأندرويد
// لأن الإشعارات هناك بتتسجل عن طريق بلجن Capacitor الأصلي (Push Notifications)
if (!Capacitor.isNativePlatform() && 'serviceWorker' in navigator) {
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
