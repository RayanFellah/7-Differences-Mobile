import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    sidenavOpen = true;
    isChatVisible: boolean = false;
    showChatComponents: boolean = true;

    constructor() {}

    ngOnInit() {
    //     this.router.events.pipe(
    //         filter(event => event instanceof NavigationEnd)
    //     ).subscribe((event: RouterEvent) => {
    //         //dont navigate when signupo or login PAges 
    //         const navigationEndEvent = event as NavigationEnd;
    //         const routesWhereSidenavShouldBeClosed = ['/login', '/signup'];
    //         this.showChatComponents = !routesWhereSidenavShouldBeClosed.includes(navigationEndEvent.urlAfterRedirects);
    //         if (!this.showChatComponents) {
    //             this.sidenavOpen = false;
    //             this.isChatVisible = false;
    //         }
    //     });
    // }

    // toggleChat(): void {
    //     if (this.showChatComponents) {
    //         this.isChatVisible = !this.isChatVisible;
    //         this.sidenavOpen = !this.sidenavOpen;
    //     }
    }
}
