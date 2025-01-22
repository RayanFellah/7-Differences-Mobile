import { Service } from 'typedi';

@Service()
export class CheckLoggedUserService {
    constructor(private users: string[]) {
        setInterval(this.isUserActive, 10000);
    }

    isUserActive() {
        this.users.forEach((user, index) => {

        });
    }
}