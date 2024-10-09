import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { icons } from './icons-provider';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideNzIcons(icons),
    provideNzI18n(en_US),
    importProvidersFrom(FormsModule),
    provideAnimationsAsync(),
    provideHttpClient(),

    // Configuración de Firebase
    provideFirebaseApp(() =>
      initializeApp({
        projectId: "web-segut",
        appId: "1:955600859150:web:5e27be9c6f57e77a02cc5f",
        storageBucket: "web-segut.appspot.com",
        apiKey: "AIzaSyCZlcqZnXy-RezezHCyPDIwbi6Qck_GCH0",
        authDomain: "web-segut.firebaseapp.com",
        messagingSenderId: "955600859150",
        measurementId: "G-Z8KLCZGB58",
      })
    ),
    provideAuth(() => getAuth()),
    provideAnalytics(() => getAnalytics()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),

    // Servicios adicionales de seguimiento
    ScreenTrackingService,
    UserTrackingService, provideFirebaseApp(() => initializeApp({"projectId":"web-segut","appId":"1:955600859150:web:5e27be9c6f57e77a02cc5f","storageBucket":"web-segut.appspot.com","apiKey":"AIzaSyCZlcqZnXy-RezezHCyPDIwbi6Qck_GCH0","authDomain":"web-segut.firebaseapp.com","messagingSenderId":"955600859150","measurementId":"G-Z8KLCZGB58"})), provideAuth(() => getAuth()), provideAnalytics(() => getAnalytics()), ScreenTrackingService, UserTrackingService, provideFirestore(() => getFirestore()), provideStorage(() => getStorage()),
  ],
};
