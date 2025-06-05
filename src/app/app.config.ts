import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeng/themes/lara'; 
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient ,withInterceptors} from '@angular/common/http';
import { authInterceptor  } from './core/interceptors/auth.interceptor';
import { provideClientHydration } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import { Chart } from 'chart.js/auto';

// Register English locale
registerLocaleData(localeEn);

// Register Chart.js
Chart.register();

export const appConfig: ApplicationConfig = {
    providers: [
        provideAnimationsAsync(),
        providePrimeNG({ theme: { preset: Lara, options: { dark: false } } }),
        provideHttpClient(),
        provideRouter(routes),
        provideAnimations(),
        provideHttpClient(withInterceptors([authInterceptor ])),
        provideClientHydration()
    ]
};
