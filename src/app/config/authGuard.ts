import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {

  const token = localStorage.getItem('token');

  if (token) return true;

  globalThis.location.href = '/login';
  return false;
};
