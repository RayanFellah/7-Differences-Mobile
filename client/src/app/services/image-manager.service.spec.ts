import { TestBed } from '@angular/core/testing';
import { ImageManagerService } from './image-manager.service';

describe('ImageManagerService', () => {
    let service: ImageManagerService;
    const IMAGE_STRING_HEADER = 'data:application/octet-stream;base64';
    const createTestImageFile = async (): Promise<File> => {
        return fetch('../../assets/image_tests/image_2_diff.bmp')
            .then(async (response) => response.blob())
            .then(async (blob) => {
                const file = new File([blob], 'test-image.bmp', { type: 'image/bmp' });
                return new Promise((resolve, reject) => {
                    createImageBitmap(blob)
                        .then(() => resolve(file))
                        .catch(reject);
                });
            });
    };

    beforeEach(() => {
        service = TestBed.inject(ImageManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('validateImage should return true with a valid image format', async () => {
        const file = await createTestImageFile();
        const result = await service.validateImage(file);
        expect(result).toBeTruthy();
    });

    it('validateImage should return false with an invalid image format', async () => {
        spyOn(service, 'fileToString').and.returnValue(Promise.resolve('data:image/jpeg;base64,'));
        const file = await createTestImageFile();
        const result = await service.validateImage(file);
        expect(result).toBeFalsy();
    });

    it('validateImage should return undefined with an empty file', async () => {
        const file = '' as unknown as File;
        const result = await service.validateImage(file);
        expect(result).toBeUndefined();
    });

    it('validateImage should call fileToString', async () => {
        const file = await createTestImageFile();
        const spy = spyOn(service, 'fileToString').and.callThrough();
        await service.validateImage(file);
        expect(spy).toHaveBeenCalled();
    });

    it('validateImage should call validateImageSize', async () => {
        const file = await createTestImageFile();
        const spy = spyOn(service, 'validateImageSize').and.callThrough();
        await service.validateImage(file);
        expect(spy).toHaveBeenCalled();
    });

    it('validateImageSize should return true with a valid image size', async () => {
        const file = await createTestImageFile();
        const image = new Image();
        image.src = URL.createObjectURL(file);
        const result = await service.validateImageSize(image);
        expect(result).toBeTruthy();
    });

    it('validateImageSize should return false with an invalid image size', async () => {
        const file = await createTestImageFile();
        const image = new Image();
        image.width = 200;
        image.height = 200;
        image.src = URL.createObjectURL(file);
        const result = await service.validateImageSize(image);
        expect(result).toBeFalsy();
    });

    it('validateImage should return the image if the image size is valid', async () => {
        const file = await createTestImageFile();
        spyOn(service, 'fileToString').and.returnValue(Promise.resolve('data:image/bmp;base64,'));
        spyOn(service, 'validateImageSize').and.returnValue(Promise.resolve(true));
        const result = await service.validateImage(file);
        expect(result).toEqual('data:image/bmp;base64,');
    });

    it('validateImage should reject the image if the image size is invalid', async () => {
        const file = new File([''], 'test.bmp', { type: 'image/bmp' });
        spyOn(service, 'fileToString').and.returnValue(Promise.resolve('data:image/bmp;base64,'));
        spyOn(service, 'validateImageSize').and.returnValue(Promise.resolve(false));
        try {
            await service.validateImage(file);
            fail('Expected method to reject.');
        } catch (error) {
            expect(error).toEqual('data:image/bmp;base64,');
        }
    });

    it('fileToString should resolve with the file content as a string', async () => {
        const fileContent = 'test file content';
        const file = new File([fileContent], 'test.txt');
        const result = await service.fileToString(file);
        expect(result).toEqual(`${IMAGE_STRING_HEADER},${window.btoa(fileContent)}`);
    });

    it('should return undefined if reader.result is null', async () => {
        const fileContent = 'test file content';
        const file = new File([fileContent], 'test.txt');
        const readerSpy = jasmine.createSpyObj('FileReader', ['readAsDataURL']);
        spyOn(window as any, 'FileReader').and.returnValue(readerSpy);

        const promise = service.fileToString(file);

        readerSpy.onload(null);
        const result = await promise;
        expect(result).toBeUndefined();
    });

    it('fileToString should return undefined with an empty file', async () => {
        const file = '' as any as File;
        const result = await service.fileToString(file);
        expect(result).toBeUndefined();
    });
});
