import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppComponent } from '@app/pages/app/app.component';
import { ConfigPageComponent } from '@app/pages/config-page/config-page.component';
import { LimitedTimePageComponent } from '@app/pages/limited-time-page/limited-time-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { AvatarSelectorComponent } from './components/avatar-selector/avatar-selector.component';
import { ChannelWidgetComponent } from './components/channel-widget/channel-widget.component';
import { ChatWidgetComponent } from './components/chat-widget/chat-widget.component';
import { ChronometreComponent } from './components/chronometre/chronometre.component';
import { ClassicGameConstantsComponent } from './components/classic-game-constants/classic-game-constants.component';
import { ClueComponent } from './components/clue/clue.component';
import { ControlVideoToolComponent } from './components/control-video-tool/control-video-tool.component';
import { ControlVideoComponent } from './components/control-video/control-video.component';
import { CounterComponent } from './components/counter/counter.component';
import { CustomButtonComponent } from './components/custom-button/custom-button.component';
import { DrawingZoneComponent } from './components/drawing-zone/drawing-zone.component';
import { GameCardListComponent } from './components/game-card-list/game-card-list.component';
import { GameCardComponent } from './components/game-card/game-card.component';
import { GameConstantsComponent } from './components/game-constants/game-constants.component';
import { GameHistoryComponent } from './components/game-history/game-history.component';
import { GameInfoComponent } from './components/game-info/game-info.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { LogoComponent } from './components/logo/logo.component';
import { ObserverAreaComponent } from './components/observer-area/observer-area.component';
import { PopupErrorComponent } from './components/popup-error/popup-error.component';
import { PopupQuitComponent } from './components/popup-quit/popup-quit.component';
import { PopupSelectLobbyComponent } from './components/popup-select-lobby/popup-select-lobby.component';
import { PopupTextComponent } from './components/popup-text/popup-text.component';
import { ProfileEditComponent } from './components/profile-edit/profile-edit.component';
import { ReplayHistoryComponent } from './components/replay-history/replay-history.component';
import { ShopWheelComponent } from './components/shop-wheel/shop-wheel.component';
import { SignupFormComponent } from './components/signup/signup.component';
import { SoundsSelectorComponent } from './components/sounds-selector/sounds-selector.component';
import { StatsComponent } from './components/stats/stats.component';
import { ToolBarComponent } from './components/tool-bar/tool-bar.component';
import { ToolbarColorsComponent } from './components/toolbar-colors/toolbar-colors.component';
import { ToolbarToolsComponent } from './components/toolbar-tools/toolbar-tools.component';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { UserHeaderComponent } from './components/user-header/user-header.component';
import { WindowedChatComponent } from './components/windowed-chat/windowed-chat.component';
import { LimitedConfigDialogComponent } from './limited-config-dialog/limited-config-dialog.component';
import { AccountSettingsPageComponent } from './pages/account-settings-page/account-settings-page.component';
import { ChatPageComponent } from './pages/chat-page/chat-page.component';
import { ConnectionHistoryPageComponent } from './pages/connection-history-page/connection-history-page.component';
import { CreatePageComponent } from './pages/create-page/create-page.component';
import { FriendsPageComponent } from './pages/friends-page/friends-page.component';
import { GameHistoryPageComponent } from './pages/game-history-page/game-history-page.component';
import { GamePageClassic1v1Component } from './pages/game-page-classic1v1/game-page-classic1v1.component';
import { GamePageComponent } from './pages/game-page/game-page.component';
import { LimitedSelectoComponent } from './pages/limited-selecto/limited-selecto.component';
import { LimitedWaitingPageComponent } from './pages/limited-waiting-page/limited-waiting-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { PasswordConfigPageComponent } from './pages/password-config-page/password-config-page.component';
import { ReplayPageComponent } from './pages/replay-page/replay-page.component';
import { SelectoPageComponent } from './pages/selecto-page/selecto-page.component';
import { SettingsPageComponent } from './pages/settings-page/settings-page.component';
import { ShopPageComponent } from './pages/shop-page/shop-page.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { WaitingPagePlayerComponent } from './pages/waiting-page-player/waiting-page-player.component';
import { WaitingPageComponent } from './pages/waiting-page/waiting-page.component';
import { DifferencesDetectionService } from './services/differences-detection.service';
import { LobbyCommunicationService } from './services/lobby-communication.service';
import { PersistentMessengerService } from './services/persistent-messenger.service';
import { SocketService } from './services/socket.service';
/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        MainPageComponent,
        PlayAreaComponent,
        SidebarComponent,
        ConfigPageComponent,
        LimitedTimePageComponent,
        SelectoPageComponent,
        CreatePageComponent,
        DrawingZoneComponent,
        ToolBarComponent,
        ToolbarToolsComponent,
        ToolbarColorsComponent,
        GameConstantsComponent,
        GameHistoryComponent,
        ChronometreComponent,
        CounterComponent,
        LogoComponent,
        CustomButtonComponent,
        GameCardComponent,
        GameCardListComponent,
        PopupErrorComponent,
        PopupQuitComponent,
        GameInfoComponent,
        WaitingPageComponent,
        GamePageClassic1v1Component,
        PopupTextComponent,
        ReplayPageComponent,
        ControlVideoComponent,
        ControlVideoToolComponent,
        ClueComponent,
        LimitedSelectoComponent,
        ChatPageComponent,
        ChatWidgetComponent,
        ChannelWidgetComponent,
        LoginPageComponent,
        LoginFormComponent,
        SignupPageComponent,
        SignupFormComponent,
        SignupFormComponent,
        PopupSelectLobbyComponent,
        UserHeaderComponent,
        AccountSettingsPageComponent,
        ProfileEditComponent,
        AvatarSelectorComponent,
        ConnectionHistoryPageComponent,
        GameHistoryPageComponent,
        ShopPageComponent,
        ShopWheelComponent,
        FriendsPageComponent,
        LimitedWaitingPageComponent,
        ObserverAreaComponent,
        WaitingPagePlayerComponent,
        LimitedConfigDialogComponent,
        PasswordConfigPageComponent,
        SettingsPageComponent,
        SoundsSelectorComponent,
        TopBarComponent,
        ReplayHistoryComponent,
        StatsComponent,
        WindowedChatComponent,
        ClassicGameConstantsComponent,
    ],
    imports: [
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        MatDialogModule,
        ReactiveFormsModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatFormFieldModule,
        MatTableModule,
        MatPaginatorModule,
        MatCardModule,
        MatListModule,
        MatInputModule,
        MatTabsModule,
        ScrollingModule,
        MatExpansionModule, MatSidenavModule, DragDropModule, MatSlideToggleModule,
        
    
    ],
    providers: [SocketService, DifferencesDetectionService, LobbyCommunicationService, PersistentMessengerService],
    bootstrap: [AppComponent],
})
export class AppModule { }
