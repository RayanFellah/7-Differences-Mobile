import { StageLvl } from '@app/components/popup-text/popup-text.component';
import { Observer } from 'rxjs';
import { DialogFeedback } from './dialog-feedback';

export class DialogData {
    message: string;
    differencesImg: string;
    nbDifferences: number;
    btnText: string;
    btnText2: string;
    btnFileText: string;
    stage: StageLvl;
    observer: Observer<DialogFeedback>;
    preventClose: boolean;
}
