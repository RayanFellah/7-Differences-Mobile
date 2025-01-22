import { Request, Response, Router } from 'express';
import { DatabaseService } from './database.service';
// import { Db, MongoClient, UpdateFilter } from 'mongodb';
import { consts } from '@common/consts';
import { ObjectId } from 'mongodb';

export class FriendsService {
    router: Router;
    constructor(private databaseService: DatabaseService) {
        this.configureRouter();
    }
    private configureRouter(): void {
        this.router = Router();
        this.router.get('/all', async (req: Request, res: Response) => {
            try {
                const rawData = await this.databaseService.userCollection.find({}, { projection: { _id: 1, username: 1, avatar: 1 } }).toArray();
                const users = rawData.map((user) => ({
                    // eslint-disable-next-line no-underscore-dangle
                    id: user._id.toString(),
                    username: user.username,
                    avatar: user.avatar,
                }));
                return res.status(consts.HTTP_STATUS_OK).json(users);
            } catch (error) {
                return res.status(consts.HTTP_SERVER_ERROR);
            }
        });

        this.router.get('/:id', async (req: Request, res: Response) => {
            try {
                const friendsList = await this.databaseService.userCollection.findOne(
                    { _id: new ObjectId(req.params.id) },
                    { projection: { friends: 1, _id: 0 } },
                );
                if (!friendsList) {
                    console.log('NO USER FOUND');
                    return res.status(consts.HTTP_STATUS_NO_CONTENT).send('User not found');
                } else if (!friendsList.friends) {
                    console.log('NO FRIENDS');
                    return res.status(consts.HTTP_STATUS_NO_CONTENT).send('No friends');
                }
                return res.status(consts.HTTP_STATUS_OK).json(friendsList.friends);
            } catch (error) {
                return res.status(consts.HTTP_SERVER_ERROR);
            }
        });
        this.router.get('/byUsername/:username', async (req: Request, res: Response) => {
            try {
                const friendsList = await this.databaseService.userCollection.findOne(
                    { username: req.params.username },
                    { projection: { friends: 1, _id: 0 } },
                );
                if (!friendsList) {
                    console.log('NO USER FOUND');
                    return res.status(consts.HTTP_STATUS_NO_CONTENT).send('User not found');
                }
                return res.status(consts.HTTP_STATUS_OK).json(friendsList.friends);
            } catch (error) {
                return res.status(consts.HTTP_SERVER_ERROR);
            }
        });

        this.router.get('/pending/:id', async (req: Request, res: Response) => {
            try {
                const friendsList = await this.databaseService.userCollection.findOne(
                    { _id: new ObjectId(req.params.id) },
                    { projection: { submittedRequests: 1, receivedRequests: 1, _id: 0 } },
                );
                if (!friendsList) {
                    return res.status(consts.HTTP_STATUS_NO_CONTENT).send('User not found');
                }
                return res.status(consts.HTTP_STATUS_OK).json(friendsList);
            } catch (error) {
                return res.status(consts.HTTP_SERVER_ERROR);
            }
        });

        this.router.put('/request/:id', async (req: Request, res: Response) => {
            try {
                // TODO Ensure not already friends
                // TODO Ensure not already requested
                // TODO Ensure not already received
                const sender = req.params.id;
                const receiver = req.body['receiverId'];
                await this.databaseService.userCollection.updateOne({ _id: new ObjectId(sender) }, { $push: { submittedRequests: receiver } });
                await this.databaseService.userCollection.updateOne({ _id: new ObjectId(receiver) }, { $push: { receivedRequests: sender } });
                return res.status(consts.HTTP_STATUS_OK).send('Friend request sent');
            } catch (error) {
                return res.status(consts.HTTP_SERVER_ERROR);
            }
        });

        // Retirer invitation
        this.router.put('/revokeRequest/:id', async (req: Request, res: Response) => {
            try {
                // TODO Ensure both are in list
                const sender = req.params.id;
                const receiver = req.body['receiverId'];
                await this.databaseService.userCollection.updateOne({ _id: new ObjectId(sender) }, { $pull: { submittedRequests: receiver } });
                await this.databaseService.userCollection.updateOne({ _id: new ObjectId(receiver) }, { $pull: { receivedRequests: sender } });
                return res.status(consts.HTTP_STATUS_OK).send('Friend revocation successful');
            } catch (error) {
                return res.status(consts.HTTP_SERVER_ERROR);
            }
        });

        // Accepter
        this.router.put('/accept/:id', async (req: Request, res: Response) => {
            try {
                // TODO Ensure both are in list
                const receiver = req.params.id;
                const sender = req.body['senderId'];
                await this.databaseService.userCollection.updateOne(
                    { _id: new ObjectId(receiver) },
                    { $push: { friends: sender }, $pull: { receivedRequests: sender } },
                );
                await this.databaseService.userCollection.updateOne(
                    { _id: new ObjectId(sender) },
                    { $push: { friends: receiver }, $pull: { submittedRequests: receiver } },
                );
                return res.status(consts.HTTP_STATUS_OK).send('Friend added');
            } catch (error) {
                return res.status(consts.HTTP_SERVER_ERROR);
            }
        });

        // Refuser
        this.router.put('/reject/:id', async (req: Request, res: Response) => {
            try {
                // TODO Ensure both are in list
                const receiver = req.params.id;
                const sender = req.body['senderId'];
                await this.databaseService.userCollection.updateOne({ _id: new ObjectId(receiver) }, { $pull: { receivedRequests: sender } });
                await this.databaseService.userCollection.updateOne({ _id: new ObjectId(sender) }, { $pull: { submittedRequests: receiver } });
                return res.status(consts.HTTP_STATUS_OK).send('Friend request rejected');
            } catch (error) {
                return res.status(consts.HTTP_SERVER_ERROR);
            }
        });

        // Supprimer
        this.router.put('/delete/:id', async (req: Request, res: Response) => {
            try {
                // TODO Ensure both are in list
                const sender = req.params.id;
                const receiver = req.body['receiverId'];
                await this.databaseService.userCollection.updateOne({ _id: new ObjectId(sender) }, { $pull: { friends: receiver } });
                await this.databaseService.userCollection.updateOne({ _id: new ObjectId(receiver) }, { $pull: { friends: sender } });
                return res.status(consts.HTTP_STATUS_OK).send('Friend deleted');
            } catch (error) {
                return res.status(consts.HTTP_SERVER_ERROR);
            }
        });
    }
}
