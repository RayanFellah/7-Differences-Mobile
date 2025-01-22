import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core';
import { AuthentificationService } from '@app/services/authentification.service';
import { DifferencesDetectionService } from '@app/services/differences-detection.service';
import { Vec2 } from '@common/vec2';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-popup-error',
    templateUrl: './popup-error.component.html',
    styleUrls: ['./popup-error.component.scss'],
})
export class PopupErrorComponent implements AfterViewInit, OnDestroy {
    @Input() show = false;
    @Input() mousePosition: Vec2 = { x: 0, y: 0 };
    destroy$ = new Subject<any>();

    constructor(private differencesDetectionService: DifferencesDetectionService, public authService: AuthentificationService) {}

    ngAfterViewInit(): void {
        let start = true;
        const ONE_SECOND = 1000;

        this.differencesDetectionService.mousePositionObservable.pipe(takeUntil(this.destroy$)).subscribe((response) => {
            this.mousePosition = response;
        });
        this.differencesDetectionService.validation.pipe(takeUntil(this.destroy$)).subscribe((response) => {
            if (!response && !start) {
                this.show = true;
                setTimeout(() => {
                    this.show = false;
                }, ONE_SECOND);
            } else if (start) {
                start = false;
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next('destroy');
        this.destroy$.complete();
    }
}
