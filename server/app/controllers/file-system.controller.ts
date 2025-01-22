import { DatabaseService } from '@app/services/database.service';
import { FileSystemService } from '@app/services/file-system.service';
import { consts } from '@common/consts';
import { GameCardTemplate } from '@common/game-card-template';
import { Constants, GameEnded, GameMode, NewTime } from '@common/game-classes';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';
@Service()
export class FileSystemController {
    router: Router;

    constructor(public fileSystemService: FileSystemService, private databaseService: DatabaseService) {
        this.configureRouter();
    }
    destructor() {
        this.databaseService.closeConnection();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/image', async (req: Request, res: Response) => {
            const img: string = req.body.img;
            const id = await this.fileSystemService.saveImage('../server/assets/img', img);
            res.status(id === consts.EMPTY_ID ? consts.HTTP_BAD_REQUEST : consts.HTTP_STATUS_CREATED);
            res.send(id);
        });

        this.router.post('/gameCard', (req: Request, res: Response) => {
            const gameCard = req.body.gameCard as GameCardTemplate;
            if (!gameCard) {
                res.sendStatus(consts.HTTP_BAD_REQUEST);
            } else {
                const saveGameCardPromise = this.fileSystemService.saveGameCard(gameCard);

                const setMockDataSoloPromise = this.databaseService.setMockData(gameCard.id as string, GameMode.CLASSIQUE_SOLO);
                const setMockData1v1Promise = this.databaseService.setMockData(gameCard.id as string, GameMode.CLASSIQUE_1V1);

                Promise.all([saveGameCardPromise, setMockDataSoloPromise, setMockData1v1Promise])
                    .then(() => {
                        res.sendStatus(consts.HTTP_STATUS_CREATED);
                    })
                    .catch(() => {
                        res.sendStatus(consts.HTTP_SERVER_ERROR);
                    });
            }
        });

        this.router.get('/image', (req: Request, res: Response) => {
            const id: string = req.query.id as string;
            console.log('downloading image');
            console.log(id);

            this.fileSystemService
                .getImage(id)
                .then((image) => {
                    console.log('image found');
                    
                    res.status(consts.HTTP_STATUS_OK);
                    res.send(image);
                })
                .catch(() => {
                    console.log('image not found');
                    res.sendStatus(consts.HTTP_STATUS_NO_CONTENT);
                });
        });

        this.router.get('/gameCards', (req: Request, res: Response) => {
            console.log("Fetching game cards for Android");
            this.fileSystemService
                .getGameCards()
                .then((gameCards) => {
                    console.log(gameCards)
                    res.status(consts.HTTP_STATUS_OK);
                    res.json(gameCards);
                })
                .catch(() => res.sendStatus(consts.HTTP_STATUS_NO_CONTENT));
        });

        this.router.get('/gameCard', (req: Request, res: Response) => {
            const id: string = req.query.id as string;
            this.fileSystemService
                .getGameCardById(id)
                .then((gameCard) => {
                    res.status(consts.HTTP_STATUS_OK);
                    res.json(gameCard);
                })
                .catch(() => res.sendStatus(consts.HTTP_STATUS_NO_CONTENT));
        });

        this.router.delete('/gameCard', (req: Request, res: Response) => {
            const id: string = req.query.id as string;
            const saveGameCardPromise = this.fileSystemService.deleteGameCard(id);
            const deleteBestTimesPromise = this.databaseService.deleteBestTimes(id);
            Promise.all([saveGameCardPromise, deleteBestTimesPromise])
                .then(() => {
                    res.sendStatus(consts.HTTP_STATUS_OK);
                })
                .catch(() => {
                    res.sendStatus(consts.HTTP_STATUS_NO_CONTENT);
                });
        });

        this.router.delete('/gameCards', async (req: Request, res: Response) => {
            await this.databaseService.deleteAllBestTimes();
            this.fileSystemService
                .deleteAllGameCards()
                .then(() => res.sendStatus(consts.HTTP_STATUS_OK))
                .catch(() => res.sendStatus(consts.HTTP_SERVER_ERROR));
        });

        this.router.post('/gameEnded', (req: Request, res: Response) => {
            const gameEnded = req.body.gameEnded as GameEnded;
            if (!gameEnded) {
                res.sendStatus(consts.HTTP_BAD_REQUEST);
            } else {
                this.databaseService
                    .saveGameToHistory(gameEnded)
                    .then(() => {
                        res.sendStatus(consts.HTTP_STATUS_CREATED);
                    })
                    .catch(() => res.sendStatus(consts.HTTP_SERVER_ERROR));
            }
        });


        this.router.get('/history', (req: Request, res: Response) => {
            this.databaseService
                .getHistory()
                .then((history) => {
                    res.status(consts.HTTP_STATUS_OK);
                    res.json(history);
                })
                .catch(() => res.sendStatus(consts.HTTP_SERVER_ERROR));
        });

        this.router.get('/message', (req: Request, res: Response) => {
            this.databaseService
                .getMessage()
                .then((message) => {
                    res.status(consts.HTTP_STATUS_OK);
                    res.json(message);
                })
                .catch(() => res.sendStatus(consts.HTTP_SERVER_ERROR));
        });


        this.router.delete('/history', (req: Request, res: Response) => {
            this.databaseService
                .deleteHistory()
                .then(() => res.sendStatus(consts.HTTP_STATUS_OK))
                .catch(() => res.sendStatus(consts.HTTP_SERVER_ERROR));
        });

        this.router.post('/newTime', (req: Request, res: Response) => {
            const newTime = req.body.newTime as NewTime;
            if (!newTime) {
                res.sendStatus(consts.HTTP_BAD_REQUEST);
            } else {
                this.databaseService
                    .setNewTime(newTime)
                    .then((status) => {
                        if (status) {
                            res.sendStatus(consts.HTTP_STATUS_CREATED);
                        } else {
                            res.sendStatus(consts.HTTP_STATUS_OK);
                        }
                    })
                    .catch(() => {
                        res.sendStatus(consts.HTTP_SERVER_ERROR);
                    });
            }
        });

        this.router.get('/bestTimes', (req: Request, res: Response) => {
            const gameCardId = req.query.gameCardId as string;
            if (!gameCardId) {
                res.sendStatus(consts.HTTP_BAD_REQUEST);
            } else {
                this.databaseService
                    .getBestTimes(gameCardId)
                    .then((bestTimes) => {
                        res.status(consts.HTTP_STATUS_OK);
                        res.json(bestTimes);
                    })
                    .catch(() => res.sendStatus(consts.HTTP_SERVER_ERROR));
            }
        });

        this.router.delete('/bestTimes/all', (req, res) => {
            this.fileSystemService.getGameCards().then((gameCards) => {
                const gameCardIds = gameCards.map((gameCard) => gameCard.id) as string[];
                if (gameCardIds && gameCardIds.length !== 0) {
                    this.databaseService
                        .resetAllBestTimes(gameCardIds)
                        .then(() => res.sendStatus(consts.HTTP_STATUS_OK))
                        .catch(() => res.sendStatus(consts.HTTP_SERVER_ERROR));
                } else {
                    res.sendStatus(consts.HTTP_STATUS_NO_CONTENT);
                }
            });
        });

        this.router.delete('/bestTimes', (req: Request, res: Response) => {
            const gameCardId = req.query.gameCardId as string;
            if (!gameCardId) {
                res.sendStatus(consts.HTTP_BAD_REQUEST);
            } else {
                this.databaseService
                    .resetBestTimes(gameCardId)
                    .then(() => res.sendStatus(consts.HTTP_STATUS_OK))
                    .catch(() => res.sendStatus(consts.HTTP_SERVER_ERROR));
            }
        });

        this.router.get('/constants', (req: Request, res: Response) => {
            this.databaseService
                .getConstants()
                .then((constants) => {
                    res.status(consts.HTTP_STATUS_OK);
                    res.json(constants);
                })
                .catch(() => res.sendStatus(consts.HTTP_SERVER_ERROR));
        });

        this.router.post('/constants', (req: Request, res: Response) => {
            const constants = req.body.constants as Constants;
            if (!constants) {
                res.sendStatus(consts.HTTP_BAD_REQUEST);
            } else {
                this.databaseService
                    .setConstants(constants)
                    .then(() => {
                        res.sendStatus(consts.HTTP_STATUS_CREATED);
                    })
                    .catch(() => res.sendStatus(consts.HTTP_SERVER_ERROR));
            }
        });


    }


}
