import { consts } from '@common/consts';
import { Service } from 'typedi';

@Service()
export class ValidationService {
    validate(ioObj: any): any {
        const pos = ioObj.pos;
        const diff = ioObj.diff;
        const validationObj = {
            validation: false,
            diff: ioObj.diff,
            diffFound: null,
        };
        if (diff) {
            for (let i = 0; i < diff.length; i++) {
                const element = diff[i];
                const index = (pos.x + pos.y * consts.IMAGE_WIDTH) * consts.PIXEL_SIZE;
                if (element.points.includes(index)) {
                    const diffFound = ioObj.diff.splice(i, 1);
                    validationObj.validation = true;
                    validationObj.diff = ioObj.diff;
                    validationObj.diffFound = diffFound;

                    return validationObj;
                }
            }
        }
        return validationObj;
    }
}
