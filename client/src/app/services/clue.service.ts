import { Injectable } from '@angular/core';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { CluePositions } from '@app/interfaces/clue-positions';
import { Difference } from '@app/interfaces/difference';
import { constsClue, constsImage, constsSoundSpeed } from '@common/consts';
import { Message } from '@common/message';
import { Vec2 } from '@common/vec2';
import { DifferencesDetectionService } from './differences-detection.service';
import { ReplayService } from './replay.service';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root',
})
export class ClueService {
  differenceArray: Difference[] | undefined;
  leftPlayArea: PlayAreaComponent;
  rightPlayArea: PlayAreaComponent;
  leftPlayAreaCoord: Vec2;
  rightPlayAreaCoord: Vec2;
  audio: HTMLAudioElement;
  audioInterval: ReturnType<typeof setInterval>;
  isIntervalActive: boolean;

  constructor(
    private differencesDetectionService: DifferencesDetectionService,
    private socketService: SocketService,
    private replayService: ReplayService
  ) {
    this.differencesDetectionService.difference.subscribe((diffArray) => {
      this.differenceArray = diffArray;
    });
    this.isIntervalActive = false;
    this.socketService.listen('validation').subscribe((response: any) => {
      if (response.validation && this.isIntervalActive) {
        this.stopClue3Interval();
      }
    });
  }

  initAudio() {
    this.audio = new Audio();
    this.audio.src = 'assets/audio/indice.mp3';
  }

  setPlayAreas(leftPlayArea: PlayAreaComponent, rightPlayArea: PlayAreaComponent) {
    this.leftPlayArea = leftPlayArea;
    this.rightPlayArea = rightPlayArea;
  }

  updateLeftPlayAreaCoord(coord: Vec2) {
    this.leftPlayAreaCoord = coord;
  }

  updateRightPlayAreaCoord(coord: Vec2) {
    this.rightPlayAreaCoord = coord;
  }

  sendMessage() {
    const message = new Message('Indice utilisé');
    this.socketService.emit('localMessage', message);
  }

  selectRandomDifference(): Difference {
    if (this.differenceArray) {
      const randomIndex = Math.floor(Math.random() * this.differenceArray.length);
      return this.differenceArray[randomIndex];
    }
    return { points: [] };
  }

  selectRandomDot(): Vec2 {
    const randomDifference = this.selectRandomDifference();
    const randomIndex = Math.floor(Math.random() * randomDifference.points.length);
    const randomDot = randomDifference.points[randomIndex];
    const y = (randomDot / constsImage.PIXEL_SIZE) / constsImage.IMAGE_WIDTH;
    const x = (randomDot / constsImage.PIXEL_SIZE) % constsImage.IMAGE_WIDTH;
    return { x, y };
  }

  findClueZonePositions(canvasPosition: DOMRect, randomDot: Vec2, scale: number): CluePositions {
    const left = Math.floor(randomDot.x / (constsImage.IMAGE_WIDTH / scale)) * (constsImage.IMAGE_WIDTH / scale);
    const top = Math.floor(randomDot.y / (constsImage.IMAGE_HEIGHT / scale)) * (constsImage.IMAGE_HEIGHT / scale);
    const positions = {
      top: canvasPosition.top + top,
      left: canvasPosition.left + left,
      height: canvasPosition.height / scale,
      width: canvasPosition.width / scale,
    }
    return positions;
  }

  setClueZonePositions(clueZone: HTMLDivElement, cluePosition: CluePositions) {
    clueZone.style.top = `${cluePosition.top}px`;
    clueZone.style.left = `${cluePosition.left}px`;
    clueZone.style.height = `${cluePosition.height}px`;
    clueZone.style.width = `${cluePosition.width}px`;
  }

  setOpacityClueZone(opacity: string) {
    this.leftPlayArea.clueZone.nativeElement.style.opacity = opacity;
    this.rightPlayArea.clueZone.nativeElement.style.opacity = opacity;
  }

  setTimeoutClueZone() {
    setTimeout(() => {
      this.setOpacityClueZone(constsClue.NULL_OPACITY);
    }, constsClue.CLUE_ZONE_TIMEOUT);
  }

  changeClueZonePosition(cluesRemaining: number, playArea: PlayAreaComponent, randomDot: Vec2) {
    const canvasPosition = playArea.canvasElement.nativeElement.getBoundingClientRect();
    const clueZoneElement = playArea.clueZone.nativeElement;
    if (cluesRemaining === constsClue.N_CLUES) {
      const clue2Position = this.findClueZonePositions(canvasPosition, randomDot, constsClue.CLUE2_SCALE);
      this.setClueZonePositions(clueZoneElement, clue2Position);
    }
    else {
      const clue1Position = this.findClueZonePositions(canvasPosition, randomDot, constsClue.CLUE1_SCALE);
      this.setClueZonePositions(clueZoneElement, clue1Position);
    }
  }

  sendClue1And2Random(nCluesLeft: number) {
    const randomDot = this.selectRandomDot();
    this.sendClue1And2(nCluesLeft, randomDot);

    this.replayService.addClueFrameEventReplay(nCluesLeft, randomDot);
  }

  sendClue1And2(nCluesLeft: number, dot: Vec2) {
    this.setOpacityClueZone(constsClue.CLUE_ZONE_OPACITY);
    this.changeClueZonePosition(nCluesLeft, this.leftPlayArea, dot);
    this.changeClueZonePosition(nCluesLeft, this.rightPlayArea, dot);
    this.setTimeoutClueZone();
  }

  findDistanceBetweenCoords(coord1: Vec2, coord2: Vec2): number {
    return Math.sqrt(Math.pow(coord2.x - coord1.x, constsClue.FIND_DISTANCE_POWER) + Math.pow(coord2.y - coord1.y, constsClue.FIND_DISTANCE_POWER));
  }

  findMinDistance(mouseCoord: Vec2, difference: Difference): number {
    let minDistance = Number.MAX_SAFE_INTEGER;
    difference.points.forEach((point) => {
      const y = (point / constsImage.PIXEL_SIZE) / constsImage.IMAGE_WIDTH;
      const x = (point / constsImage.PIXEL_SIZE) % constsImage.IMAGE_WIDTH;
      const dot = { x, y };
      const distance = this.findDistanceBetweenCoords(mouseCoord, dot);
      if (distance < minDistance) {
        minDistance = distance;
      }
    });
    return minDistance;
  }

  async changeAudioPlayBackRate(difference: Difference) {
    const playbackRate = this.findAudioPlayBackRate(difference, this.leftPlayAreaCoord, this.rightPlayAreaCoord)
    this.setAudioPlayBackRate(playbackRate);

    this.replayService.addClueSoundEventReplay(true, this.audio.playbackRate);
  }

  async setAudioPlayBackRate(playbackRate: number) {
    this.audio.playbackRate = playbackRate;
    if (this.audio.paused) {
      await this.audio.play().catch((err: any) => {
        console.log(err);
      });
    }
  }

  startClue3Interval() {
    const randomDifference = this.selectRandomDifference();
    this.initClue3Interval();
    this.audioInterval = setInterval(() => {
      this.changeAudioPlayBackRate(randomDifference);
    }, constsClue.CLUE3_INTERVAL_TIMEOUT);

    this.replayService.addClueSoundEventReplay(true, this.audio.playbackRate);
  }

  initClue3Interval() {
    this.isIntervalActive = true;
    this.initAudio();
  }

  stopClue3Interval() {
    this.isIntervalActive = false;
    clearInterval(this.audioInterval);
    this.audio.pause();
    this.audio.currentTime = 0;

    this.replayService.addClueSoundEventReplay(false);
  }

  findSoundSpeed(distance: number): number {

    if (distance < constsSoundSpeed.VERY_FAST_TRESHOLD) {
      return constsSoundSpeed.VERY_FAST;
    } else if (distance < constsSoundSpeed.FAST_TRESHOLD) {
      return constsSoundSpeed.FAST;
    } else if (distance < constsSoundSpeed.NORMAL_TRESHOLD) {
      return constsSoundSpeed.NORMAL;
    }
    return constsSoundSpeed.SLOW;
  }

  checkCoordInLimits(coord: Vec2): boolean {
    return coord.x >= 0 && coord.x <= constsImage.IMAGE_WIDTH && coord.y >= 0 && coord.y <= constsImage.IMAGE_HEIGHT;
  }

  findAudioPlayBackRate(difference: Difference, leftPlayAreaCoord: Vec2, rightPlayAreaCoord: Vec2): number {
    if (this.checkCoordInLimits(leftPlayAreaCoord)) {
      const minDistanceDiff = this.findMinDistance(leftPlayAreaCoord, difference);
      return this.findSoundSpeed(minDistanceDiff);
    }
    else if (this.checkCoordInLimits(rightPlayAreaCoord)) {
      const minDistanceDiff = this.findMinDistance(rightPlayAreaCoord, difference);
      return this.findSoundSpeed(minDistanceDiff);
    }
    else {
      return constsSoundSpeed.SLOW;
    }
  }

}
