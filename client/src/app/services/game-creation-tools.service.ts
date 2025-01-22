import { Injectable } from "@angular/core";
import { consts } from "@common/consts";
import { CreatePageService } from "./create-page.service";
import { DialogService } from "./dialog.service";
import { ImageManagerService } from "./image-manager.service";

@Injectable({
    providedIn: 'root',
})
export class GameCreationToolsService {
    img1Set: boolean = false;
    img2Set: boolean = false;
    lastUpload: string = '';
    dialogService: DialogService;
    constructor(
        private readonly imageManagerService: ImageManagerService,
        public createPageService: CreatePageService,
    ) {};

    setImage(event: Event) {
        const elem = event.target as HTMLInputElement;
        const files = elem.files as FileList;
        this.lastUpload = elem.id;
        this.imageToStorage(elem.id, files[0]);
        (event.target as HTMLInputElement).value = '';
    }

    imageToStorage(id: string, file: File | null) {
        this.imageManagerService
            .validateImage(file as File)
            .then(async (img) => {
                if (img && file) {
                    const drawImage = img;
                    img = img.replace('data:image/bmp;base64,', '');
                    if (id === 'uploadImageL' || id === 'uploadImageBoth') {
                        this.img1Set = true;
                        localStorage.setItem('img1', img);
                        this.createPageService.drawCanvas(drawImage, this.createPageService.childLeftCanvas.canvas.nativeElement);
                    }
                    if (id === 'uploadImageR' || id === 'uploadImageBoth') {
                        this.img2Set = true;
                        localStorage.setItem('img2', img);
                        this.createPageService.drawCanvas(drawImage, this.createPageService.childRightCanvas.canvas.nativeElement);
                    }
                } else {
                    this.dialogService.openDialogWrongFormat();
                }
            })
            .catch(() => {
                this.dialogService.openDialogWrongFormat();
            });
    }

    clearCanvas(id: number) {
        if (id !== 1) {
            const leftCanvasElem = this.createPageService.childLeftCanvas.canvas
            const leftCanvas = leftCanvasElem.nativeElement;
            const ctx = leftCanvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, leftCanvas.width, leftCanvas.height);
                const img = new Image();
                img.src = '../../assets/image_tests/image_0_diff.bmp';
                console.log(img.src);
                img.onload = () => {
                    ctx.drawImage(img, 0, 0);
                    console.log(img);
                }
            }
            localStorage.removeItem('img1');
            this.img1Set = false;
        }
        if (id !== 0) {
            const rightCanvasElem = this.createPageService.childRightCanvas.canvas
            const rightCanvas = rightCanvasElem.nativeElement;
            const ctx = rightCanvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, rightCanvas.width, rightCanvas.height);
                const img = new Image();
                img.src = '../../assets/image_tests/image_0_diff.bmp';
                img.onload = () => {
                    ctx.drawImage(img, 0, 0);
                }
            }
            localStorage.removeItem('img2');
            this.img2Set = false;
        }
    }

    reinitForeground(event: Event) {
        const elem = event.target as HTMLButtonElement;
        const id = parseInt(elem.id, 10);
        const leftcanvas = this.createPageService.childLeftCanvas
        const rightcanvas = this.createPageService.childRightCanvas
        if (id === 0) {
            leftcanvas.ctxForeground.clearRect(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
        } else {
            if (id === 1) {
                rightcanvas.ctxForeground.clearRect(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
            } else {
                leftcanvas.ctxForeground.clearRect(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
                rightcanvas.ctxForeground.clearRect(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
            }
        }
        const canvasTemp = document.createElement('canvas');
        canvasTemp.width = consts.IMAGE_WIDTH;
        canvasTemp.height = consts.IMAGE_HEIGHT;
        this.createPageService.updateCanvasHistory(canvasTemp, id);
    }
    duplicateForeground(event: Event) {
        const id = Number((event.target as Element).id);
        const canvasTemp = document.createElement('canvas');
        canvasTemp.width = consts.IMAGE_WIDTH;
        canvasTemp.height = consts.IMAGE_HEIGHT;
        const ctx = canvasTemp.getContext('2d') as CanvasRenderingContext2D;
        ctx.drawImage(id === 0 ? this.createPageService.childLeftCanvas.canvasF.nativeElement : this.createPageService.childRightCanvas.canvasF.nativeElement, 0, 0);
        const rightCanvas = this.createPageService.childRightCanvas;
        const leftCanvas = this.createPageService.childLeftCanvas;
        if (id === 0) {
            rightCanvas.ctxForeground.clearRect(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
            rightCanvas.ctxForeground.drawImage(canvasTemp, 0, 0);
            this.createPageService.updateCanvasHistory(rightCanvas.canvasF.nativeElement, 1);
        } else {
            leftCanvas.ctxForeground.clearRect(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
            leftCanvas.ctxForeground.drawImage(canvasTemp, 0, 0);
            this.createPageService.updateCanvasHistory(leftCanvas.canvasF.nativeElement, 0);
        }
    }

    exchangeForeground() {
        const canvasTemp = document.createElement('canvas');
        canvasTemp.width = consts.IMAGE_WIDTH;
        canvasTemp.height = consts.IMAGE_HEIGHT;
        const ctx = canvasTemp.getContext('2d') as CanvasRenderingContext2D;
        const leftCanvas = this.createPageService.childLeftCanvas;
        const rightCanvas = this.createPageService.childRightCanvas;
        ctx.drawImage(leftCanvas.canvasF.nativeElement, 0, 0);
        leftCanvas.ctxForeground.clearRect(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
        leftCanvas.ctxForeground.drawImage(rightCanvas.canvasF.nativeElement, 0, 0);
        rightCanvas.ctxForeground.clearRect(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
        rightCanvas.ctxForeground.drawImage(canvasTemp, 0, 0);
        this.createPageService.updateCanvasHistory(leftCanvas.canvasF.nativeElement, 3, rightCanvas.canvasF.nativeElement);
    }
};