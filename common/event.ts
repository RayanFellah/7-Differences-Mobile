export interface IEventDescription{
    time:number;
    play():void;
    x?:number;
    y?:number;
    userCounter?:number[];
    color?:string;
    rectangle?:{startX:number, startY:number, width:number, height:number};
}
export interface IeventClick extends IEventDescription{
    x:number;
    y:number;
}
export interface IeventCounter extends IEventDescription{
    isAdversary:boolean;
}
export type EventDescription = IeventClick | IeventCounter;
