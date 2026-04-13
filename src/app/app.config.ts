import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {jwtInterceptor} from './pages/login/jwt.interceptor';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';

export const appConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([jwtInterceptor])
    )
  ]
};
