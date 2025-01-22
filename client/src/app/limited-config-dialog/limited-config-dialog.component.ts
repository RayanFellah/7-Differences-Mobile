import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-limited-config-dialog',
  templateUrl: './limited-config-dialog.component.html',
  styleUrls: ['./limited-config-dialog.component.scss']
})
export class LimitedConfigDialogComponent implements OnInit {
  gameTime: number = 60; 
  rewardTime: number = 60; 
  penaltyTime: number = 1;
  cheatMode: boolean = false; 


  constructor(public dialogRef: MatDialogRef<LimitedConfigDialogComponent>) { }

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
