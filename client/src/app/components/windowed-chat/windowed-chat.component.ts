import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MultiWindowService } from '@app/services/multi-window.service';
import { ChannelWidgetComponent } from '@app/components/channel-widget/channel-widget.component';

@Component({
    selector: 'app-windowed-chat',
    templateUrl: './windowed-chat.component.html',
    styleUrls: ['./windowed-chat.component.scss'],
})

// This is served on /windowedChat and is used by child process.
export class WindowedChatComponent implements OnInit, AfterViewInit {
    @ViewChild(ChannelWidgetComponent) chat: ChannelWidgetComponent;

    constructor(public mws: MultiWindowService) {}

    ngOnInit(): void {
        this.mws.initChildProcess();
    }

    ngAfterViewInit() {
        this.chat.state = 'fullscreen';
    }
}
