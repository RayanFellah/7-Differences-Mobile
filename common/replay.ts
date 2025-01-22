import { EventDescription } from "./event";
export interface IReplay{
    dateHeure:Date;
    gameCardId:string;
    gameCardName:string;
    userNames:string[];
    saved:boolean;
    eventHistory:EventDescription[];
}
export type Replay = IReplay;