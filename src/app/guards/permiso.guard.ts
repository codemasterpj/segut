import { CanMatchFn } from '@angular/router';

export const permisoGuard: CanMatchFn = (route, segments) => {
  return true;
};
