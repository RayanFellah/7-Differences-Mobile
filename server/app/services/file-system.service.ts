import { consts } from '@common/consts';
import { GameCardTemplate } from '@common/game-card-template';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import { Service } from 'typedi';

@Service()
export class FileSystemService {

    async saveImage(path: string, data: string): Promise<string> {

        const id: string = randomUUID();
        return fs.promises
            .writeFile(`${path}/${id}.bmp`, data, { encoding: 'base64' })
            .then(() => {
                return id;
            })
            .catch(() => {
                return consts.EMPTY_ID;
            });
    }

    async getImage(id: string): Promise<string> {
        console.log("getting image");
        console.log("id: " + id);
        return fs.promises.readFile(`../server/assets/img/${id}.bmp`, { encoding: 'base64' });
    }

    async saveGameCard(gameCard: GameCardTemplate, link: fs.PathLike = '../server/assets/gameCards.json'): Promise<void> {
        console.log("id prealable " + gameCard.id)
        if (!gameCard.id) {
            console.log('no id');
            gameCard.id = randomUUID();
        }
        console.log(gameCard.id);

        const gameCards = await this.getGameCards(link);
        gameCards.push(gameCard);

        const newContent = JSON.stringify({ gameCards });

        fs.promises.writeFile(link, newContent);
    }

    async deleteGameCard(id: string): Promise<void> {
        const gameCards = await this.getGameCards();
        const index = gameCards.findIndex((gameCard) => gameCard.id === id);
        if (index !== -1) {
            await fs.promises.unlink(`../server/assets/img/${gameCards[index].img1ID}.bmp`);
            await fs.promises.unlink(`../server/assets/img/${gameCards[index].img2ID}.bmp`);

            gameCards.splice(index, 1);
            const newContent = JSON.stringify({ gameCards });

            return fs.promises.writeFile('../server/assets/gameCards.json', newContent);
        }

        return Promise.reject(`Game card with id ${id} not found`);
    }

    async deleteAllGameCards(): Promise<void> {
        const gameCards = await this.getGameCards();
        for (let i = 0; i < gameCards.length; i++) {
            await fs.promises.unlink(`../server/assets/img/${gameCards[i].img1ID}.bmp`);
            await fs.promises.unlink(`../server/assets/img/${gameCards[i].img2ID}.bmp`);
        }

        const newContent = JSON.stringify({ gameCards: [] });

        return fs.promises.writeFile('../server/assets/gameCards.json', newContent);
    }

    async getGameCards(link: fs.PathLike = '../server/assets/gameCards.json'): Promise<GameCardTemplate[]> {
        return new Promise((resolve, reject) => {
            fs.promises.readFile(link)
                .then((gameCards) => {
                    resolve(JSON.parse(gameCards.toString()).gameCards);
                })
                .catch(() => {
                    reject([]);
                });
        });
    }

    async getGameCardById(id: string, link?: fs.PathLike): Promise<GameCardTemplate | undefined> {
        const gameCards = await this.getGameCards(link)
        console.log("gamecards: " + gameCards);
        return gameCards.find((gameCard) => gameCard.id === id);
    }

    async getGameCardsLength(): Promise<number> {
        const gameCards = await this.getGameCards();
        return gameCards.length;
    }

    async duplicateGameCard(id: string): Promise<void> {
        console.log("duplicating game card");
        const gameCard = await this.getGameCardById(id);
        if (gameCard) {
            console.log("game card found");
            const newGameCard = Object.assign({}, gameCard);

            await this.getImage(gameCard.img1ID).then(async (img1) => {
                console.log("img1");
                await this.saveImage('../server/assets/imgReplay', img1).then((id) => {
                    console.log("id img1: " + id);
                    newGameCard.img1ID = id;
                });
                await this.getImage(gameCard.img2ID).then(async (img2) => {
                    console.log("img2");
                    await this.saveImage('../server/assets/imgReplay', img2).then((id) => {
                        console.log("id img2: " + id);
                        newGameCard.img2ID = id;
                    });
                });
            }).then(async () => {
                await this.saveGameCard(newGameCard, '../server/assets/gameCardsReplay.json');
            });
        }
    }
}
