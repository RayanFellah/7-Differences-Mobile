import { Injectable } from '@angular/core';
import { consts } from '@common/consts';

@Injectable({
    providedIn: 'root',
})
export class ImageManagerService {
    async fileToString(file: File | null) {
        if (file) {
            const reader = new FileReader();
            return new Promise<string | undefined>((resolve) => {
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result?.toString());
            });
        }
        return undefined;
    }

    async validateImage(file: File) {
        const image = (await this.fileToString(file)) as string;
        if (file && image.startsWith('data:image/bmp;base64,')) {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            return new Promise<string>((resolve, reject) => {
                this.validateImageSize(img).then((valid) => {
                    if (valid) resolve(image);
                    reject(image);
                });
            });
        }
        return undefined;
    }
    async validateImageSize(img: HTMLImageElement): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            img.onload = () => {
                resolve(img.width === consts.IMAGE_WIDTH && img.height === consts.IMAGE_HEIGHT);
            };
        });
    }
}
