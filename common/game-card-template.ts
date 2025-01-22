import { Difference } from "../client/src/app/interfaces/difference";

export enum Difficulty {
    Easy = 'Facile',
    Hard = 'Difficile',
}

export class GameCardTemplate {

    id: string | undefined;
    name: string;
    difficulty: Difficulty;

    img1ID: string;
    img2ID: string;
    differences: Difference[];

    initDefault(): void {
        this.difficulty = Difficulty.Easy;
        this.differences = [];
    }

    isComplete(): boolean {
        return this.name != undefined &&
            this.difficulty != undefined &&
            this.differences != undefined;
    }
}
