
import { consts } from '@common/consts';
import { Service } from 'typedi';
import { Difference } from '../../../client/src/app/interfaces/difference';


import { createCanvas, loadImage } from 'canvas';

@Service()
export class ImageUpdaterLimiteService {
    lastImg1Src: string = '';
    lastImg2Src: string = '';



    constructor() {

    }
    canvasToBMPBase64(canvas:any) {
        return `data:image/bmp;base64,${canvas.toBuffer().toString('base64')}`;
    }
    

   async removeDifferences(img1Src:string, img2Src:string, differences:Difference[]){

    console.log("removeDifferences", img1Src, img2Src, differences);
  
    const img1 = await loadImage(img1Src);
    const img2 = await loadImage(img2Src);

    const canvas1 = createCanvas(consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
    const canvas2 = createCanvas(consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');

    ctx1.drawImage(img1, 0, 0);
    ctx2.drawImage(img2, 0, 0);

    const data1 = ctx1.getImageData(0, 0,consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);
    let data2 = ctx2.getImageData(0, 0, consts.IMAGE_WIDTH, consts.IMAGE_HEIGHT);

    for(let difference of differences){
        data2 = this.updateData(difference, data1, data2);
      


    }


    ctx2.putImageData(data2, 0, 0);

    const updatedImg1Src = this.canvasToBMPBase64(canvas1);
    const updatedImg2Src = this.canvasToBMPBase64(canvas2);

    this.lastImg1Src = updatedImg1Src;
    this.lastImg2Src = updatedImg2Src;

    

    return { left:updatedImg1Src, right:updatedImg2Src };

    }

    updateData(difference:any, data1:any, data2:any) {
        // Same implementation as before, no changes needed here
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
