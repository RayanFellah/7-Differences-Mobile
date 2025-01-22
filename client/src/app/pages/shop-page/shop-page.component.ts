import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PopupTextComponent } from '@app/components/popup-text/popup-text.component';
import { ShopWheelComponent } from '@app/components/shop-wheel/shop-wheel.component'; // Import the missing ShopeWheelComponent
import { DialogData } from '@app/interfaces/dialog-data';
import { AudioService } from '@app/services/audio.service';
import { AvatarService } from '@app/services/avatar.service';
import { LanguageService } from '@app/services/language.service';
import { ShopService } from '@app/services/shop.service';
import { Item } from '@common/items';
import { IUser } from '@common/user';

@Component({
  selector: 'app-shop-page',
  templateUrl: './shop-page.component.html',
  styleUrls: ['./shop-page.component.scss']
})
export class ShopPageComponent implements OnInit {
  audioService: AudioService;
  isChatVisible: boolean = false;
  defaultAvatarPrice: number = 100;

  medals: Item[] = [];
  avatarsNames: string[] = [];
  sounds: Item[] = [];
  boughtItems: Item[] = [];

  userCurrentDinars: number;
  hoveredItem: any;

    constructor(
        private readonly shopService: ShopService,
        public avatarService: AvatarService,
        private dialogRef: MatDialog,
        protected ls: LanguageService,
    ) {
    this.audioService = new AudioService();
  }

  ngOnInit(): void {
    this.medals = this.shopService.getMedals();
    this.sounds = this.shopService.getSounds();
    this.avatarsNames = this.avatarService.getAllAvatars();
    this.userCurrentDinars = this.shopService.currentUser?.dinars || 0;
    this.shopService.getBoughtItems(this.shopService.currentUser?.username!).subscribe((res: any) => {
      this.boughtItems = res.body.boughtItems;
    });
  }


  buyMedal(medal: Item): void {
    this.shopService.buyMedal(medal).subscribe({
      next: (res: any) => {
        console.log(res.body.message);
        this.purchaseDialog(res.body.message);
        this.updateDinars(medal);
        this.boughtItems.push(medal);
      },
      error: (error) => {
        this.purchaseDialog(error.error.message);
      }
    });
  }

  buyAvatar(avatarName: string): void {
    console.log('buying avatar', avatarName);
    const avatarItem: Item = {
      name: avatarName,
      path: this.avatarService.getAvatarPath(avatarName),
      price: this.defaultAvatarPrice,
      type: 'Avatar'
    }

    this.shopService.buyAvatar(avatarItem).subscribe({
      next: (res: any) => {
        this.purchaseDialog(res.body.message);
        this.updateDinars(avatarItem);
        this.boughtItems.push(avatarItem);
      },
      error: (error) => {
        this.purchaseDialog(error.err.message);
      }
    });
  }

  buySound(sound: Item) {
    this.shopService.buySound(sound).subscribe({
      next: (res: any) => {
        this.purchaseDialog(res.body.message);
        this.updateDinars(sound);
        this.boughtItems.push(sound);
      },
      error: (error) => {
        this.purchaseDialog(error.error.message);
      }
    });
  }

  playSound(sound: Item) {
    this.audioService.playSound(sound.path!);
  }

  private purchaseDialog(message: string) {
    PopupTextComponent.openDialog(this.dialogRef, {
      message: `<h2> ${message} </h2>`,
      preventClose: false,
    } as DialogData);
  }

  private updateDinars(item: Item) {
    this.userCurrentDinars = this.shopService.currentUser?.dinars! - item.price;
    this.avatarService.authService.setUser({ ...this.shopService.currentUser, dinars: this.shopService.currentUser!.dinars! - item.price } as IUser);
  }

  isOwned(itemName: string): boolean {
    return this.shopService.itemIsOwned(this.boughtItems, itemName);
  }

  openFortuneWheel(): void {
    if (this.userCurrentDinars < 5) {
      this.purchaseDialog('Vous n\'avez pas assez de dinars pour jouer à la roue de la fortune.');
      return;
    } else if (this.isOwned('Multiplicateur x2')) {
      this.purchaseDialog('Vous avez déjà gagné un multiplicateur de points.');
      return;
    }
    this.updateDinars({ name: 'Multiplicateur x2', price: 5, type: 'Point Multiplier' } as Item);
    this.dialogRef.open(ShopWheelComponent, {
      width: '500px'
    });
  } 
  toggleChat(): void {
    this.isChatVisible = !this.isChatVisible;
}

  
}
