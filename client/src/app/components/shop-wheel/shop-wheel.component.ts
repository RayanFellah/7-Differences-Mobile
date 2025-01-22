import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogData } from '@app/interfaces/dialog-data';
import { ShopService } from '@app/services/shop.service';
// import { Item } from '@common/items';
import { PopupTextComponent } from '../popup-text/popup-text.component';

@Component({
  selector: 'app-shop-wheel',
  templateUrl: './shop-wheel.component.html',
  styleUrls: ['./shop-wheel.component.scss']
})
export class ShopWheelComponent {
  transform = '';
  items = ['Rien', 'Rien', 'Rien','Rien', 'Multiplicateur x2', 'Rien', 'Rien', 'Rien'];
  hasWonGameMultiplier: boolean = false;

  constructor(private dialog: MatDialog, private shopService: ShopService) {}

  spinWheel() {
    const value = Math.floor(Math.random() * 3600);
    this.transform = `rotate(${value}deg)`;

    setTimeout(() => {
      const index = Math.floor(((value + 22.5) % 360) / 45);
      const selectedItem = index == 0 ? this.items[7] : this.items[index - 1];
      console.log('Selected item:', selectedItem);
      if (selectedItem === 'Rien') {
        this.shopService.buySpinWheelTurn(false).subscribe((res) => {
          this.wonNothing();
        });
      } else {
        this.shopService.buySpinWheelTurn(true).subscribe((res) => {
          this.wonGameMultiplier();
        });
      }
    }, 5000);
  }

  wonNothing() {
    PopupTextComponent.openDialog(
      this.dialog,
      {
        message: `Vous n'avez rien gagné.`,
      } as DialogData,
    );
  }

  wonGameMultiplier() {
    // const gameMultiplier: Item = {
    //   name: 'Multiplicateur x2',
    //   type: 'Point Multiplier',
    //   price: 5,
    // }
    this.hasWonGameMultiplier = true;
    this.shopService.boughtItems.push({name: 'Multiplicateur x2', type: 'Point Multiplier', price: 5});
    // this.shopService.updateHasGameMultiplier(gameMultiplier).subscribe((res) => {
    //   console.log('Point multiplier updated', res);
    // });
    PopupTextComponent.openDialog(
      this.dialog,
      {
        message: `Vous avez gagnez un multiplicateur de points! Félicitations!`,
      } as DialogData,
    );
  }
}