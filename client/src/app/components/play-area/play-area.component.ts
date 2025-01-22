import { AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Difference } from '@app/interfaces/difference';
import { DifferencesDetectionService } from '@app/services/differences-detection.service';
import { ReplayService } from '@app/services/replay.service';
import { consts } from '@common/consts';
import { Vec2 } from '@common/vec2';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit {
    @Input() url: string;
    @Input() diff: Difference[] | undefined;
    @Input() isObserver: boolean=false;
    @ViewChild('gridCanvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('clueZone') clueZone: ElementRef<HTMLDivElement>;

    coord: BehaviorSubject<Vec2>;

    buttonPressed = '';

    private canvasSize = { x: consts.IMAGE_WIDTH, y: consts.IMAGE_HEIGHT };
    constructor(public differencesDetectionService: DifferencesDetectionService,
        private readonly replayService: ReplayService,
        private router: Router,
    ) {
        this.coord = new BehaviorSubject({ x: -1, y: -1 });
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    get canvasElement(): ElementRef<HTMLCanvasElement> {
        return this.canvas;
    }

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;
    }

    @HostListener('mousemove', ['$event'])
    mouseMove(event: MouseEvent) {
        this.coord.next({ x: event.offsetX, y: event.offsetY });
    }

    @HostListener('mouseleave')
    mouseLeave() {
        this.coord.next({ x: -1, y: -1 });
    }

    ngAfterViewInit(): void {
        this.canvas.nativeElement.focus();
    }

    clickHandle($event: MouseEvent) {
        if (this.router.url !== '/replay' && !this.isObserver) {
            
            this.replayService.addClickEventReplay({ x: $event.offsetX, y: $event.offsetY });
            this.differencesDetectionService.mouseHitDetect($event, this.diff);
        }
    }
}
