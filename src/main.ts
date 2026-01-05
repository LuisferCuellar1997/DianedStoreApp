import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { environment } from './environments/environments';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router'; // <-- IMPORTANTE
import { routes } from './app/app.routes';      // <-- IMPORTANTE
registerLocaleData(localeEsCo);

bootstrapApplication(App,  {
  providers: [
    {provide: LOCALE_ID, useValue: 'es-CO'},
    provideHttpClient(),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
  ],
}).then(()=>{
   console.log('App bootstrapped correctamente');
})
.catch((err) => console.error(err));
