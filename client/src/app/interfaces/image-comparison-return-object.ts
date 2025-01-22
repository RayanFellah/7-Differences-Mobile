import { Difference } from './difference';

export interface ImageComparisonReturnObject {
    imageDiff: Uint8ClampedArray;
    arrayDiff: Difference[];
    isValid: boolean;
    isEasy: boolean;
}
