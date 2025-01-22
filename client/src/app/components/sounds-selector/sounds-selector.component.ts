import { Component, OnInit } from '@angular/core';
import { AudioService } from '@app/services/audio.service';
import { AuthentificationService } from '@app/services/authentification.service';
import { LanguageService } from '@app/services/language.service';
import { ShopService } from '@app/services/shop.service';
import { Item } from '@common/items';

@Component({
  selector: 'app-sounds-selector',
  templateUrl: './sounds-selector.component.html',
  styleUrls: ['./sounds-selector.component.scss']
})
export class SoundsSelectorComponent implements OnInit {

  boughtSounds: Item[] = [];

  constructor(private shopService: ShopService, private audioService: AudioService, private authService: AuthentificationService, protected ls: LanguageService) {}

  ngOnInit(): void {
    this.shopService.getBoughtItems(this.shopService.currentUser?.username!).subscribe((res: any) => {
      console.log('res.body.boughtItems', res.body.boughtItems);
      this.boughtSounds = res.body.boughtItems.filter((item: Item) => item.type === 'Sound');
      console.log('this.boughtSounds', this.boughtSounds);
    });
  }

  playSound(sound: Item) {
    this.audioService.playSound(sound.path!);
  }

  useSpecialSound(sound: Item) {
    if (sound.name === 'Son de succès') {
      this.authService.specialSuccessSoundUsed = true;
    }
    if (sound.name === 'Son d\'échec') {
      this.authService.specialErrorSoundUsed = true;
    }
  }

  unUseSpecialSound(sound: Item) {
    if (sound.name === 'Son de succès') {
      this.authService.specialSuccessSoundUsed = false;
    }
    if (sound.name === 'Son d\'échec') {
      this.authService.specialErrorSoundUsed = false;
    }
  }

  isUsed(soundName: string) {
    if (soundName === 'Son de succès') {
      return this.authService.specialSuccessSoundUsed;
    }
    if (soundName === 'Son d\'échec') {
      return this.authService.specialErrorSoundUsed;
    }
    return false;
  }
}
