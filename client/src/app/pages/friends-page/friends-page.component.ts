import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AccountSettingsService } from '@app/services/account-settings.service';
import { AvatarService } from '@app/services/avatar.service';
import { FriendsService } from '@app/services/friends.service';
import { LanguageService } from '@app/services/language.service';
import { IUser } from '@common/user';

@Component({
    selector: 'app-friends-page',
    templateUrl: './friends-page.component.html',
    styleUrls: ['./friends-page.component.scss']
})
export class FriendsPageComponent implements OnInit, OnDestroy {
    allUsers: Partial<IUser>[] = [];
    filteredUsers: Partial<IUser>[] = [];
    sentPendingRequests: Partial<string>[] = [];
    receivedPendingRequests: Partial<string>[] = [];
    receivedPendingRequestsUsers: Partial<IUser>[] = [];
    friendsList: Partial<string>[] = [];
    intervalId: number;  isChatVisible: boolean = false;


    selectedUserUsername: string | null = null;
    selectedUserFriends: Partial<IUser>[] = [];

    searchTerm = '';
    user: IUser;

    constructor(
        private friendsService: FriendsService,
        public avatarService: AvatarService,
        private accountService: AccountSettingsService,
        protected ls: LanguageService,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        this.user = this.accountService.currentUser ? this.accountService.currentUser : {} as IUser;
        this.loadUsersInitial();
        this.getPendingRequests();
        this.getAllFriends();

        this.intervalId = window.setInterval(() => {
            this.loadUsers();
            this.getPendingRequests();
            this.getAllFriends();
            this.cdr.detectChanges();
        }, 5000);
    }


    ngOnDestroy(): void {
        if (this.intervalId) {
          clearInterval(this.intervalId);
        }
    }

    onSearchChange(searchValue: string): void {
        this.searchTerm = searchValue;
        this.filterUsers();
    }

  isFriend(userId: string): boolean {
    return this.friendsList ?  this.friendsList.includes(userId) : false;
  }

    isReceivedPendingRequest(userId: string): boolean {
        console.log('receivedPendingRequests', this.receivedPendingRequests);
        return this.receivedPendingRequestsUsers.map(user => user.id).includes(userId);
    }

    isSentRequest(userId: string): boolean {
        return this.sentPendingRequests.includes(userId);
    }

    sendFriendRequest(receiverId: string): void {
        this.friendsService.sendFriendRequest(this.user.id!, receiverId).subscribe({
            next: () => {
                console.log('Friend request sent');
                this.sentPendingRequests.push(receiverId);
            },
            error: (err) => {
                console.error('Error sending friend request', err);
            }
        });
    }

    revokeFriendRequest(receiverId: string): void {
        this.friendsService.revokeFriendRequest(this.user.id!, receiverId).subscribe({
            next: () => {
                console.log('Friend request revoked');
                this.sentPendingRequests = this.sentPendingRequests.filter(id => id !== receiverId);
            },
            error: (err) => {
                console.error('Error revoking friend request', err);
            }
        });
    }

    acceptFriendRequest(senderId: string): void {
        this.friendsService.acceptFriendRequest(this.user.id!, senderId).subscribe({
            next: () => {
                console.log('Friend request accepted');
                this.receivedPendingRequests = this.receivedPendingRequests.filter(id => id !== senderId);
                this.receivedPendingRequestsUsers = this.receivedPendingRequestsUsers.filter(user => user.id !== senderId);
                this.friendsList.push(senderId);
            },
            error: (err) => {
                console.error('Error accepting friend request', err);
            }
        });
    }

    deleteFriend(friendId: string): void {
        this.friendsService.deleteFriend(this.user.id!, friendId).subscribe({
            next: () => {
                console.log('Friend deleted');
                this.friendsList = this.friendsList.filter(id => id !== friendId);
            },
            error: (err) => {
                console.error('Error deleting friend', err);
            }
        });
    }

    rejectFriendRequest(senderId: string): void {
        this.friendsService.rejectFriendRequest(this.user.id!, senderId).subscribe({
            next: () => {
                console.log('Friend request rejected');
                this.receivedPendingRequests = this.receivedPendingRequests.filter(id => id !== senderId);
                this.receivedPendingRequestsUsers = this.receivedPendingRequestsUsers.filter(user => user.id !== senderId);
            },
            error: (err) => {
                console.error('Error rejecting friend request', err);
            }
        });
    }


    setSelectedUserUsername(username: string): void {
        this.selectedUserUsername = username;
    }

    selectUser(username: string, userId: string): void {
        this.selectedUserFriends = [];
        this.setSelectedUserUsername(username);
        this.friendsService.getFriends(userId).subscribe((friends: any) => {
            console.log('Selected user friends', friends);
            this.selectedUserFriends = this.allUsers.filter((user) => friends.includes(user.id));
        }, error => {
            console.error('Error fetching friends', error);
            this.selectedUserFriends = [];
        });
    }

  private getAllFriends(): void {
    this.friendsService.getFriends(this.user.id!).subscribe((res: any) => {
      console.log('Friends', res);
      this.friendsList = res ? res : [];
    });
  }

  private getPendingRequests(): void {
    this.friendsService.getPendingRequests(this.user.id!).subscribe((res: any) => {
      console.log('Pending requests', res);
      this.sentPendingRequests = res.submittedRequests ? res.submittedRequests : [];
      this.receivedPendingRequests = res.receivedRequests ? res.receivedRequests : [];
      this.receivedPendingRequestsUsers = this.allUsers.filter((user) => this.receivedPendingRequests.includes(user.id!));
    })
  }

    private loadUsersInitial() {
        this.friendsService.getAllUsers().subscribe((users: any) => {
            this.allUsers = users;
            this.filteredUsers = [...this.allUsers];
            console.log('allUsers', this.allUsers);
        });
    }

    private loadUsers() {
        this.friendsService.getAllUsers().subscribe((users: any) => {
            this.allUsers = users;
            console.log('allUsers', this.allUsers);
        });
    }

  private filterUsers(): void {
    if (!this.searchTerm) {
      this.filteredUsers = [...this.allUsers];
    } else {
      this.filteredUsers = this.allUsers.filter(user => user.username!.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  toggleChat(): void {
    this.isChatVisible = !this.isChatVisible;
}
}
