import { ElementRef, Injectable } from '@angular/core';
import { Difference } from '@app/interfaces/difference';

@Injectable({
  providedIn: 'root'
})
export class DifferenceGeneratorService {

  constructor() { }
  colors=["red","green","blue","yellow","purple","orange","pink","brown","black","white","gray","cyan","magenta","olive","lime","teal"];

  run(numDifferences: number, imageWidth: number, imageHeight: number, canvas1: ElementRef<HTMLCanvasElement>,
    canvas2: ElementRef<HTMLCanvasElement>) {
    const differences = this.generateRandomDifferences(numDifferences, imageWidth, imageHeight);
    const ctx2 = canvas2.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    this.drawDifferences(differences, ctx2, imageWidth, imageHeight);
    return { differences, c2: canvas2 };
  }
/*
  generateRandomDifferences(numDifferences: number, imageWidth: number, imageHeight: number): Difference[] {
    const differences: Difference[] = [];
    
    for (let i = 0; i < numDifferences; i++) {
      const points: number[] = [];
      const numPoints = Math.floor(Math.random() * 100) + 10; // Random number of points between 10 and 109
      const startX = Math.floor(Math.random() * (imageWidth - 50)) + 25; // Random starting point
      const startY = Math.floor(Math.random() * (imageHeight - 50)) + 25;
    
      let x = startX;
      let y = startY;
      points.push(y * imageWidth + x); // Add the starting point to the points array
    
      for (let j = 1; j < numPoints; j++) {
        const angle = Math.random() * 2 * Math.PI; // Random angle
        const distance = Math.floor(Math.random() * 20) + 5; // Random distance between 5 and 24
        const newX = x + Math.floor(Math.cos(angle) * distance);
        const newY = y + Math.floor(Math.sin(angle) * distance);
    
            // Check if the new point is within the image bounds
        if (newX >= 0 && newX < imageWidth && newY >= 0 && newY < imageHeight) {
            x = newX;
            y = newY;
            points.push(y * imageWidth + x); // Add the new point to the points array
        } else {
            // If the new point is outside the image bounds, break the loop
            break;
        }
      }
    
      differences.push({ points });
    }
    
    return differences;
  }
  */

  generateRandomDifferences(numDifferences: number, imageWidth: number, imageHeight: number): Difference[] {
    const differences: Difference[] = [];
    const usedPoints = new Set<number>();  // Set to store used points

    for (let i = 0; i < numDifferences; i++) {
        const points: number[] = [];
        const numPoints = Math.floor(Math.random() * 20) + 10; // Random number of points between 10 and 59

        let attempts = 0;
        while (points.length < numPoints && attempts < 50000) { // Limit attempts to avoid infinite loops
            const startX = Math.floor(Math.random() * (imageWidth - 50)) + 25; // Random starting point within bounds
            const startY = Math.floor(Math.random() * (imageHeight - 50)) + 25;
            let x = startX;
            let y = startY;
            let pointIndex = y * imageWidth + x;

            if (!usedPoints.has(pointIndex)) {
                points.push(pointIndex);
                usedPoints.add(pointIndex);
                for (let j = 1; j < numPoints && points.length < numPoints; j++) {
                    const angle = Math.random() * 2 * Math.PI; // Random angle
                   // const distance = Math.floor(Math.random() * 20) + 5; // Random distance between 5 and 24
                   const distance = Math.floor(Math.random() * 10) + 5; 
                    const newX = x + Math.floor(Math.cos(angle) * distance);
                    const newY = y + Math.floor(Math.sin(angle) * distance);
                    let oldIndex = pointIndex;
                    pointIndex = newY * imageWidth + newX;

                    if (newX >= 0 && newX < imageWidth && newY >= 0 && newY < imageHeight && !usedPoints.has(pointIndex)) {
                      //pointIndex = newY * imageWidth + newX;
                        x = newX;
                        y = newY;
                        points.push(pointIndex);
                        usedPoints.add(pointIndex);
                    }else if (usedPoints.has(pointIndex)){
                      pointIndex = oldIndex;}else{
                        break;}
                }
            }
            attempts++;
        }

        if (points.length > 0) {
            differences.push({ points });
        }
    }

    return differences;
}





  drawDifferences(differences: Difference[], ctx: CanvasRenderingContext2D, imageWidth: number, imageHeight: number) {
   // ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    
    for (const difference of differences) {
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      ctx.strokeStyle = color;
      const startY=Math.floor(difference.points[0] / imageWidth);
      const startX=difference.points[0] - imageWidth * startY;
      ctx.moveTo(startX, startY);
      ctx.beginPath();
      for (const point of difference.points) {
        const y = Math.floor(point / imageWidth);
        const x = point - imageWidth * y;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    return ctx ;
  }
  
}


/*
drawDifferences(differences: Difference[], ctx: CanvasRenderingContext2D, imageWidth: number, imageHeight: number) {
  // ctx.strokeStyle = 'red';
   ctx.lineWidth = 3;
   
   for (const difference of differences) {
     const color = this.colors[Math.floor(Math.random() * this.colors.length)];
     ctx.strokeStyle = color;
     ctx.beginPath();
     for (const point of difference.points) {
       const y = Math.floor(point / imageWidth);
       const x = point - imageWidth * y;
       ctx.lineTo(x, y);
     }
     ctx.stroke();
   }
   return ctx ;
 }
}
*/
