import { Component, Input, OnInit } from '@angular/core';
import { ClueService } from '@app/services/clue.service';

import { Router } from '@angular/router';
import { constsClue } from '@common/consts';
import { ChronometreComponent } from '../chronometre/chronometre.component';
import { PlayAreaComponent } from '../play-area/play-area.component';

@Component({
  selector: 'app-clue',
  templateUrl: './clue.component.html',
  styleUrls: ['./clue.component.scss'],
  providers: [ClueService],
})
export class ClueComponent implements OnInit {
  @Input() leftPlayArea: PlayAreaComponent;
  @Input() rightPlayArea: PlayAreaComponent;
  @Input() timer: ChronometreComponent;
  @Input() isClassic: boolean;
  @Input() PENALTY: number;
  nClues: number;

  constructor(public clueService: ClueService, public router: Router) {}

  ngOnInit(): void {
    this.nClues = constsClue.N_CLUES;
    window.addEventListener('keydown', this.keydownHandler);
    this.leftPlayArea.coord.subscribe((coord) => {
      this.clueService.updateLeftPlayAreaCoord(coord);
    });
    this.rightPlayArea.coord.subscribe((coord) => {
      this.clueService.updateRightPlayAreaCoord(coord);
    });
    this.clueService.setPlayAreas(this.leftPlayArea, this.rightPlayArea);
  }

  keydownHandler = (event: KeyboardEvent): void => {
    if (event.key === 'i' && this.nClues > 0 && this.router.url !== '/replay') {
      this.sendClue();
    }
  };

  sendClue() {
    this.clueService.sendMessage();
    this.timer.applyPenalty(this.isClassic);
    if (this.nClues !== 1) {
      this.clueService.sendClue1And2Random(this.nClues);
    } else {
      this.clueService.startClue3Interval();
    }
    this.nClues--;
  }

  removeEventListener() {
    window.removeEventListener('keydown', this.keydownHandler);
  }

  ngOnDestroy() {
    this.removeEventListener();
    if (this.clueService.isIntervalActive) {
      this.clueService.stopClue3Interval();
    }
  }
}
