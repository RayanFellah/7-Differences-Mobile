import { Injectable } from '@angular/core';
import { Difference } from '@app/interfaces/difference';

@Injectable({
  providedIn: 'root',
})
export class ImageTransferService {
  link1 = '';
  link2 = '';
  img1: string;
  img2: string;
  diff: Difference[] | undefined;
}
