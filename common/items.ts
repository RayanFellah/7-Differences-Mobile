type ItemType = 'Avatar' | 'Medal' | 'Sound' | 'Point Multiplier';
interface IItem {
    path?: string;
    name: string;
    type: ItemType;
    price: number;
    description?: string;
}

export type Item = IItem;