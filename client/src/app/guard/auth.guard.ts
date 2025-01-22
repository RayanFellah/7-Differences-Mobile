import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthentificationService } from '@app/services/authentification.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard {
    constructor(private router: Router, private readonly authService: AuthentificationService) {}
    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const validAuthentifcation = this.authService.isLoggedIn;
        if (validAuthentifcation) {
            return true;
        } else {
            this.router.navigate(['/login']);
            return false;
        }
    }
}

