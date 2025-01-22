/* eslint-disable max-lines */
import { DatabaseService } from '@app/services/database.service';
import { FileSystemService } from '@app/services/file-system.service';
import { UserService } from '@app/services/user.service';
import { consts } from '@common/consts';
import { Replay } from '@common/replay';
import { IUser } from '@common/user';
import { Request, Response, Router } from 'express';
import { ObjectId } from 'mongodb';
import * as multer from 'multer';
import { Service } from 'typedi';
import path = require('path');

@Service()
export class UserFileSystemController {
    router: Router;
    private multer: multer.Multer;
    // private userHistoryService: UserHistoryService;

    constructor(private userService: UserService, private databaseService: DatabaseService, private fileSystemService: FileSystemService) {
        const storage = multer.diskStorage({
            destination(req, file, cb) {
                cb(null, path.join(__dirname, '../../../../avatars/pictures/'));
            },
            filename(req, file, cb) {
                // Use the original filename
                cb(null, file.originalname);
            },
        });

        this.multer = multer({ storage });

        this.configureRouter();
        // this.userHistoryService = new UserHistoryService();
        // databaseService.start();
    }
    destructor() {
        // this.databaseService.closeConnection();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/fs/players/replay', async (req: Request, res: Response) => {
            console.log('POST /replay');
            console.log(req.body);
            
            const user = req.body.user;
            const replay = req.body.replay as Replay;
            console.log('user', user);
            
            if (user && replay) {
                try {
                    if (await this.fileSystemService.getGameCardById(replay.gameCardId, '../server/assets/gameCardsReplay.json')) {

                        console.log('Game card already exists');
                        await this.databaseService.saveReplay(user, replay);
                    } else {
                        await this.fileSystemService.duplicateGameCard(replay.gameCardId).then(async () => {
                            console.log('Game card duplicated');
                            await this.databaseService.saveReplay(user, replay);
                        });
                    }
                    res.sendStatus(consts.HTTP_STATUS_CREATED);
                } catch (error) {
                    console.error('Error saving replay:', error);
                    res.sendStatus(consts.HTTP_SERVER_ERROR);
                }
            } else {
                res.sendStatus(consts.HTTP_BAD_REQUEST);
            }
        });

        this.router.get('/fs/players/:id/replay', async (req: Request, res: Response) => {
            console.log('GET /fs/players/:username/replay-history');
            const { id } = req.params;
            const history = await this.databaseService.getUserReplayHistory(id);

            if (history) {
                res.status(200).json({
                    replays: history,
                });
            } else {
                res.status(404).send('User not found or no replay history available.');
            }
        });

        this.router.delete( '/fs/players/:id/replay/:dateHeure' , async (req: Request, res: Response)=>{
            console.log('DELETE /fs/players/:id/replay/:dateHeure');
            const { id, dateHeure } = req.params;
            console.log('id', id);
            console.log('dateHeure', dateHeure);
            if (id && dateHeure) {
                try {
                    await this.databaseService.deleteReplay(id, dateHeure);
                    res.sendStatus(consts.HTTP_STATUS_OK);
                } catch (error) {
                    console.error('Error deleting replay:', error);
                    res.sendStatus(consts.HTTP_SERVER_ERROR);
                }
            } else {
                res.sendStatus(consts.HTTP_BAD_REQUEST);
            }
        });

        // Connexion
        this.router.post('/fs/players/login', async (req: Request, res: Response) => {
            console.log(req.originalUrl);
            const userData = req.body as IUser;
            console.log('userData', userData);
            if (!userData) {
                res.sendStatus(consts.HTTP_BAD_REQUEST);
            }
            try {
                const validation = await this.userService.validateUser(userData.username, userData.password!);
                if (validation.isValid && validation.user) {
                    console.log('validation.user', validation.user.channelsAndMuted);
                    const token = this.userService.generateToken(userData.username);
                    return res.status(consts.HTTP_STATUS_OK).json({
                        token,
                        username: validation.user.username,
                        avatar: validation.user.avatar,
                        channelsAndMuted: validation.user.channelsAndMuted,
                        dinars: validation.user.dinars,
                        isThemeDark: validation.user.isThemeDark,
                        isLanguageFrench: validation.user.isLanguageFrench,
                        id: validation.user.id,
                        replays: validation.user.replays,
                    });
                } else {
                    return res.status(consts.HTTP_UNAUTHORIZED).json({ message: validation.message });
                }
            } catch (error) {
                console.error("Erreur lors de la validation de l'utilisateur:", error);
                return res.status(consts.HTTP_SERVER_ERROR).json({ message: 'Erreur serveur' });
            }
        });

        // Création d'un nouvel utilisateur
        this.router.post('/fs/players/new', async (req: Request, res: Response) => {
            const userData = req.body as IUser;
            console.log('userData', userData);
            if (!userData) {
                res.sendStatus(consts.HTTP_BAD_REQUEST);
            }
            try {
                const user = await this.userService.createUser(userData);
                if (user) {
                    const token = this.userService.generateToken(userData.username);
                    return res.status(consts.HTTP_STATUS_CREATED).json({ token, username: user.username, avatar: user.avatar, id: user.id });
                } else {
                    return res.status(consts.HTTP_CONFLICT).json({ message: "Nom d'utilisateur déjà pris" });
                }
            } catch (error) {
                console.error("Erreur lors de la création de l'utilisateur:", error);
                return res.status(consts.HTTP_SERVER_ERROR).json({ message: 'Erreur serveur' });
            }
        });

        // Déconnexion
        this.router.patch('/fs/players/:username/logout', async (req: Request, res: Response) => {
            const username = req.params.username as string;
            console.log('username', username);
            if (!username) {
                return res.sendStatus(consts.HTTP_BAD_REQUEST);
            }
            try {
                const isLoggedOut = await this.userService.logoutUser(username);
                if (isLoggedOut) {
                    console.log('disconnect');
                    return res.status(consts.HTTP_STATUS_OK).json({ message: 'Déconnexion réussie.' });
                } else {
                    return res.status(consts.HTTP_BAD_REQUEST).json({ message: 'Utilisateur non trouvé ou déjà déconnecté.' });
                }
            } catch (error) {
                console.error("Erreur lors de la déconnexion de l'utilisateur:", error);
                return res.status(consts.HTTP_SERVER_ERROR).json({ message: 'Erreur serveur' });
            }
        });

        this.router.get('/fs/players/:username/connection-history', async (req: Request, res: Response) => {
            console.log('GET /fs/players/:username/connection-history');
            const { username } = req.params;
            // const history = await this.userHistoryService.getUserConnectionHistory(username);
            const history = await this.userService.getUserConnectionHistory(username);

            if (history) {
                res.status(200).json({
                    username,
                    connectionHistory: history,
                });
            } else {
                res.status(404).send('User not found or no connection history available.');
            }
        });
        // utilisation de IUser a la place
        this.router.get('/fs/players/:username/game-history', async (req: Request, res: Response) => {
            console.log('GET /fs/players/:username/game-history');
            const { username } = req.params;
            const history = await this.databaseService.getUserGameHistory(username);

            if (history) {
                res.status(200).json({
                    username,
                    gameHistory: history,
                });
            } else {
                res.status(404).send('User not found or no game history available.');
            }
        });

        // this.router.get('/fs/players/:username/boughtAvatarsIndexes', async (req: Request, res: Response) => {
        //     const { username } = req.params;
        //     const user = this.userService.activeUsers.find((u) => u.username === username);
        //     if (user) {
        //         res.status(200).json({
        //             boughtAvatarsIndexes: user.boughtAvatarsIndexes,
        //         });
        //     } else {
        //         res.status(404).send('User not found');
        //     }
        // });
        this.router.get('/fs/players/:username/bought-avatars', async (req: Request, res: Response) => {
            const { username } = req.params;
            if (!username) {
                return res.sendStatus(consts.HTTP_BAD_REQUEST);
            }

            try {
                const boughtAvatars = await this.userService.getBoughtAvatars(username);
                return res.status(consts.HTTP_STATUS_OK).json({ boughtAvatars });
            } catch (error) {
                return res.sendStatus(consts.HTTP_SERVER_ERROR);
            }
        })

        this.router.get('/fs/players/:username/bought-medals', async (req: Request, res: Response) => {
            const { username } = req.params;
            if (!username) {
                return res.sendStatus(consts.HTTP_BAD_REQUEST);
            }

            try {
                const boughtMedals = await this.userService.getBoughtMedals(username);
                return res.status(consts.HTTP_STATUS_OK).json({ boughtMedals });
            } catch (error) {
                return res.sendStatus(consts.HTTP_SERVER_ERROR);
            }
        })

        this.router.get('/fs/players/:username/bought-items', async (req: Request, res: Response) => {
            const { username } = req.params;
            if (!username) {
                return res.sendStatus(consts.HTTP_BAD_REQUEST);
            }

            try {
                const boughtItems = await this.userService.getBoughtItems(username);
                return res.status(consts.HTTP_STATUS_OK).json({ boughtItems });
            } catch (error) {
                return res.sendStatus(consts.HTTP_SERVER_ERROR);
            }
        })

        this.router.get('/fs/players/:id/hasCustomAvatar', async (req: Request, res: Response) => {
            const id = new ObjectId(req.params.id);

            try {
                const user = await this.databaseService.userCollection.findOne(
                    { _id: id, hasCustomAvatar: { $exists: true } },
                    { projection: { _id: 0, hasCustomAvatar: 1 } }
                );
                console.log('user', user);
                if (user) {
                    return res.status(consts.HTTP_STATUS_OK).json(true);
                } else {
                    return res.status(consts.HTTP_STATUS_OK).json(false);
                }
            } catch (error) {
                return res.sendStatus(consts.HTTP_SERVER_ERROR);
            }
        })

        this.router.put('/fs/players/:username/avatar', async (req: Request, res: Response) => {
            const avatarFileName = req.body.avatar;
            const username = req.params.username;

            if (username && avatarFileName) {
                this.userService.updateUserAvatar(username, avatarFileName);
                res.status(200).send('Avatar mis à jour avec succès');
            } else {
                res.status(400).send('Bad request');
            }
        });

        this.router.post('/fs/players/:username/avatarUpload', this.multer.single('file'), (req, res) => {
            console.log(req.file, 'req.file');
            this.databaseService.userCollection.updateOne({ username: req.params.username }, { $set: { hasCustomAvatar: true } });
            res.sendStatus(200);
        });

        // Modification du profil
        this.router.put('/fs/players/:username/username', async (req: Request, res: Response) => {
            const currentUsername = req.params.username as string;
            const newUsername = req.body.username as string;
            console.log('currentUsername', currentUsername);
            console.log('newUsername', newUsername);

            if (!currentUsername || !newUsername) {
                return res.sendStatus(consts.HTTP_BAD_REQUEST);
            }

            try {
                const isUpdateSuccessful = await this.userService.updateUserUsername(currentUsername, newUsername);
                if (isUpdateSuccessful) {
                    return res.status(consts.HTTP_STATUS_OK).json({ message: 'Nom mis à jour avec succès.' });
                } else {
                    return res.status(consts.HTTP_BAD_REQUEST).json({ message: "Nom d'utilisateur déjà pris." });
                }
            } catch (error) {
                return res.status(consts.HTTP_SERVER_ERROR).json({ message: 'Erreur serveur' });
            }
        });

        this.router.patch('/fs/players/:username/language', async (req: Request, res: Response) => {
            const currentUsername = req.params.username as string;
            const isLanguageFrench = req.body.isLanguageFrench as boolean;

            if (!currentUsername || isLanguageFrench === undefined) {
                return res.sendStatus(consts.HTTP_BAD_REQUEST);
            }

            try {
                const isUpdateSuccessful = await this.userService.updateUserLanguage(currentUsername, isLanguageFrench);
                if (isUpdateSuccessful) {
                    return res.status(consts.HTTP_STATUS_OK);
                } else {
                    return res.status(consts.HTTP_BAD_REQUEST);
                }
            } catch (error) {
                return res.status(consts.HTTP_SERVER_ERROR).json({ message: 'Erreur serveur' });
            }
        });

        this.router.patch('/fs/players/:username/theme', async (req: Request, res: Response) => {
            const currentUsername = req.params.username as string;
            const isThemeDark = req.body.isThemeDark as boolean;

            if (!currentUsername || isThemeDark === undefined) {
                return res.sendStatus(consts.HTTP_BAD_REQUEST);
            }

            try {
                const isUpdateSuccessful = await this.userService.updateUserTheme(currentUsername, isThemeDark);
                if (isUpdateSuccessful) {
                    return res.status(consts.HTTP_STATUS_OK);
                } else {
                    return res.status(consts.HTTP_BAD_REQUEST);
                }
            } catch (error) {
                return res.status(consts.HTTP_SERVER_ERROR).json({ message: 'Erreur serveur' });
            }
        });

        // boutique
        this.router.post('/fs/players/:username/shop', async (req: Request, res: Response) => {
            const username = req.params.username as string;
            const item = req.body.item;
            console.log('username', username);
            console.log('item', item);

            if (!username || !item) {
                return res.sendStatus(consts.HTTP_BAD_REQUEST);
            }
            try {
                const isPurchaseSuccessful = await this.userService.purchaseItem(username, item);
                if (isPurchaseSuccessful) {
                    return res.status(consts.HTTP_STATUS_OK).json({ message: 'Achat effectué avec succès!' });
                } else {
                    return res.status(consts.HTTP_BAD_REQUEST).json({ message: "Achat impossible. Vous n'avez pas assez de dinars!" });
                }
            } catch (error) {
                return res.status(consts.HTTP_SERVER_ERROR).json({ message: 'Erreur serveur' });
            }
        });


        // wheel spin
        this.router.put('/fs/players/:username/spin-wheel', async (req: Request, res: Response) => {
            const username = req.params.username as string;
            if (!username) {
                return res.sendStatus(consts.HTTP_BAD_REQUEST);
            }
            const spinResult = req.body.spinResult as boolean;
            
            try {
                const newDinarsAmount = await this. userService.wheelSpin(username, spinResult);
                return res.status(consts.HTTP_STATUS_OK).json({ newDinarsAmount });
            } catch (error) {
                return res.sendStatus(consts.HTTP_SERVER_ERROR);
            }
        });

        this.router.put('/fs/players/:username/dinars', async (req: Request, res: Response) => {
            const username = req.params.username as string;
            const dinars = req.body.dinars as number;

            if (!username || dinars === undefined) {
                return res.sendStatus(consts.HTTP_BAD_REQUEST);
            }

            try {
                const isUpdateSuccessful = await this.databaseService.updateUserDinars(username, dinars);
                if (isUpdateSuccessful) {
                    return res.status(consts.HTTP_STATUS_OK).json({ dinars: dinars});
                } else {
                    return res.status(consts.HTTP_BAD_REQUEST).json({ message: "Impossible de mettre à jour les dinars." });
                }
            } catch (error) { 
                console.error('Error updating dinars:', error);
                return res.status(consts.HTTP_SERVER_ERROR).json({ message: 'Server Error' });
            }
        });

        // userStats
        this.router.get('/fs/players/:username/stats', async (req: Request, res: Response) => {
            const username = req.params.username as string;
            if (!username) {
                return res.sendStatus(consts.HTTP_BAD_REQUEST);
            }
            try {
                const userStats = await this.userService.getUserGameStats(username);
                return res.status(consts.HTTP_STATUS_OK).json({ userStats });
            } catch (error) {
                return res.sendStatus(consts.HTTP_SERVER_ERROR);
            }
        });
        // // userGameHistory
        // this.router.get('/fs/players/:username/game-history', async (req: Request, res: Response) => {
        //     const username = req.params.username as string;
        //     if (!username) {
        //         return res.sendStatus(consts.HTTP_BAD_REQUEST);
        //     }
        //     try {
        //         const userGameHistory = await this.userService.getUserGameHistory(username);
        //         return res.status(consts.HTTP_STATUS_OK).json({ userGameHistory });
        //     } catch (error) {
        //         return res.sendStatus(consts.HTTP_SERVER_ERROR);
        //     }
        // });

        this.router.get('/fs/players/:username/averages', async (req: Request, res: Response) => {
            const username = req.params.username as string;
            if (!username) {
                return res.sendStatus(consts.HTTP_BAD_REQUEST);
            }
            try {
                const averages = await this.databaseService.getUserAverages(username);
                console.log('averages', averages);
                return res.status(consts.HTTP_STATUS_OK).json(averages);
            } catch (error) {
                return res.sendStatus(consts.HTTP_SERVER_ERROR);
            }
        });
    }
}
