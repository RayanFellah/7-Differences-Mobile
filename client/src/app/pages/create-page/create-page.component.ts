import { Component, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DrawingZoneComponent } from '@app/components/drawing-zone/drawing-zone.component';
import { CreatePageService } from '@app/services/create-page.service';
import { DialogService } from '@app/services/dialog.service';
import { DifferenceGeneratorService } from '@app/services/difference-generator.service';
import { GameCreationToolsService } from '@app/services/game-creation-tools.service';
import { LanguageService } from '@app/services/language.service';

@Component({
    selector: 'app-create-page',
    templateUrl: './create-page.component.html',
    styleUrls: ['./create-page.component.scss'],
    providers: [CreatePageService, GameCreationToolsService, DrawingZoneComponent, DialogService],
})
export class CreatePageComponent {
    @ViewChild('leftChild', { static: true }) childLeftCanvas: DrawingZoneComponent;
    @ViewChild('rightChild', { static: true }) childRightCanvas: DrawingZoneComponent;
    isChatVisible: boolean = false;
    randomGenNumber: number = 1;
    constructor(
        public createPageService: CreatePageService,
        readonly dialogService: DialogService,
        readonly gameCreationToolsService: GameCreationToolsService,
        readonly router: Router,
        protected ls: LanguageService,
        private differenceGeneratorService: DifferenceGeneratorService,
    ) {
        localStorage.clear();
        this.gameCreationToolsService.dialogService = this.dialogService;
        this.dialogService.router = this.router;
    }

    ngAfterViewInit() {
        this.createPageService.childLeftCanvas = this.childLeftCanvas;
        this.createPageService.childRightCanvas = this.childRightCanvas;
    }

    @HostListener('document:keydown.control.z', ['$event'])
    undo() {
        this.createPageService.undo();
    }

    @HostListener('document:keydown.control.shift.z', ['$event'])
    redo() {
        this.createPageService.redo();
    }

    toggleChat(): void {
        this.isChatVisible = !this.isChatVisible;
    }


    testGenerate() {
        console.log('test generate');
        this.differenceGeneratorService.run(this.randomGenNumber, this.childLeftCanvas.canvasF.nativeElement.width, this.childLeftCanvas.canvasF.nativeElement.height, this.childLeftCanvas.canvasF, this.childRightCanvas.canvasF);

    }
}
