import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SesionService } from '../services/sesion.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isLogin = req.url.includes('/usuarios/login');
  const isRegistro = req.method === 'POST' && /\/usuarios\/?$/.test(req.url);

  if (isLogin || isRegistro) {
    return next(req);
  }

  const token = inject(SesionService).getToken();
  if (!token) {
    return next(req);
  }

  return next(
    req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) }),
  );
};
