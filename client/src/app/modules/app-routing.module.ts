import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChannelWidgetComponent } from '@app/components/channel-widget/channel-widget.component';
import { ClassicGameConstantsComponent } from '@app/components/classic-game-constants/classic-game-constants.component';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { GameConstantsComponent } from '@app/components/game-constants/game-constants.component';
// import { GameHistoryComponent } from '@app/components/game-history/game-history.component';
import { ProfileEditComponent } from '@app/components/profile-edit/profile-edit.component';
import { WindowedChatComponent } from '@app/components/windowed-chat/windowed-chat.component';
import { AuthGuard } from '@app/guard/auth.guard';
import { AccountSettingsPageComponent } from '@app/pages/account-settings-page/account-settings-page.component';
import { ChatPageComponent } from '@app/pages/chat-page/chat-page.component';
import { ConfigPageComponent } from '@app/pages/config-page/config-page.component';
import { ConnectionHistoryPageComponent } from '@app/pages/connection-history-page/connection-history-page.component';
import { CreatePageComponent } from '@app/pages/create-page/create-page.component';
import { FriendsPageComponent } from '@app/pages/friends-page/friends-page.component';
import { GameHistoryPageComponent } from '@app/pages/game-history-page/game-history-page.component';
import { GamePageClassic1v1Component } from '@app/pages/game-page-classic1v1/game-page-classic1v1.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { LimitedSelectoComponent } from '@app/pages/limited-selecto/limited-selecto.component';
import { LimitedTimePageComponent } from '@app/pages/limited-time-page/limited-time-page.component';
import { LimitedWaitingPageComponent } from '@app/pages/limited-waiting-page/limited-waiting-page.component';
import { LoginPageComponent } from '@app/pages/login-page/login-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { PasswordConfigPageComponent } from '@app/pages/password-config-page/password-config-page.component';
import { ReplayPageComponent } from '@app/pages/replay-page/replay-page.component';
import { SelectoPageComponent } from '@app/pages/selecto-page/selecto-page.component';
import { SettingsPageComponent } from '@app/pages/settings-page/settings-page.component';
import { ShopPageComponent } from '@app/pages/shop-page/shop-page.component';
import { SignupPageComponent } from '@app/pages/signup-page/signup-page.component';
import { WaitingPagePlayerComponent } from '@app/pages/waiting-page-player/waiting-page-player.component';
import { WaitingPageComponent } from '@app/pages/waiting-page/waiting-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/login' /*TODO: remettre login jai mis ca juste pour fix l'UI de replay*/, pathMatch: 'full' }, // temp
    { path: 'home', component: MainPageComponent, canActivate: [AuthGuard] },
    { path: 'game', component: GamePageComponent, canActivate: [AuthGuard] },
    { path: 'game1v1', component: GamePageClassic1v1Component, canActivate: [AuthGuard] },
    { path: 'login', component: LoginPageComponent },/*TODO: remettre login jai mis ca juste pour fix l'UI de replay*/
    { path: 'signup', component: SignupPageComponent },
    {
        path: 'config',
        component: ConfigPageComponent,
        // children: [
        //     { path: '', component: SelectoPageComponent },
        //     { path: 'create-sheet', component: CreatePageComponent },
        //     { path: 'game-constants', component: GameConstantsComponent },
        //     { path: 'game-history', component: GameHistoryComponent },
        // ],
    },
    { path: 'create-sheet', component: CreatePageComponent },
    { path: 'selecto', component: SelectoPageComponent, canActivate: [AuthGuard] },
    { path: 'limited-time', component: LimitedTimePageComponent, canActivate: [AuthGuard] },
    { path: 'limited-selecto', component: LimitedSelectoComponent, canActivate: [AuthGuard] },
    { path: 'waiting-limited', component: LimitedWaitingPageComponent, canActivate: [AuthGuard] },
    { path: 'waiting-player', component: WaitingPagePlayerComponent, canActivate: [AuthGuard] },
    { path: 'lobby', component: WaitingPageComponent, canActivate: [AuthGuard] },
    { path: 'replay', component: ReplayPageComponent, canActivate: [AuthGuard] },
    { path: 'chat', component: ChatPageComponent },
    { path: 'game-constants', component: GameConstantsComponent },
    {path: 'channel-widget', component: ChannelWidgetComponent},
    {path: 'classic-game-constants', component: ClassicGameConstantsComponent},
    {path: 'game-card', component: GameCardComponent},

    {
        path: 'account-settings',
        component: AccountSettingsPageComponent,
        children: [
            { path: 'profile', component: ProfileEditComponent },
            { path: 'connection-history', component: ConnectionHistoryPageComponent },
            { path: 'game-history', component: GameHistoryPageComponent },
            { path: 'game-stats-history', component: GameHistoryPageComponent },
        ],
        canActivate: [AuthGuard],
    },
    { path: 'shop', component: ShopPageComponent, canActivate: [AuthGuard] },
    { path: 'password', component: PasswordConfigPageComponent, canActivate: [AuthGuard] },
    { path: 'friends', component: FriendsPageComponent, canActivate: [AuthGuard] }, // temp
    { path: 'windowedChat', component: WindowedChatComponent },
    { path: 'settings', component: SettingsPageComponent, canActivate: [AuthGuard] },

    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
