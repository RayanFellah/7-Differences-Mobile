import { ElementRef, Injectable } from '@angular/core';
import { Difference } from '@app/interfaces/difference';
import { consts } from '@common/consts';

@Injectable({
    providedIn: 'root',
})
export class ImageUpdateService {
    updateImage(
        diffArray: Difference[] | undefined,
        canvas1: ElementRef<HTMLCanvasElement>,
        canvas2: ElementRef<HTMLCanvasElement>,
        img1: ImageBitmap,
        img2: ImageBitmap,
    ) {
        const ctx1 = canvas1.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        ctx1.drawImage(img1, 0, 0);
        const ctx2 = canvas2.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        ctx2.drawImage(img2, 0, 0);

        if (diffArray && diffArray[0]) {
            const difference: Difference = diffArray[0];
            const data1: ImageData = ctx1.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
            let data2: ImageData = ctx2.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);

            if (data1 && data2) {
                data2 = this.updateData(difference, data1, data2);
                ctx2.putImageData(data2, 0, 0);
            }
        }
        return { c1: canvas1, c2: canvas2 };
    }

    updateData(difference: Difference, data1: ImageData, data2: ImageData): ImageData {
        for (const point of difference.points) {
            const base = Math.floor(point / consts.PIXEL_SIZE);
            const y = Math.floor(base / consts.IMAGE_WIDTH);
            const x = base - consts.IMAGE_WIDTH * y;
            const index = consts.PIXEL_SIZE * (consts.IMAGE_WIDTH * y + x);
            data2.data[index] = data1.data[index];
            data2.data[index + 1] = data1.data[index + 1];
            data2.data[index + 2] = data1.data[index + 2];
            data2.data[index + 3] = data1.data[index + 3];
        }
        return data2;
    }
}
