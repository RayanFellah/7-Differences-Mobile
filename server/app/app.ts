import { HttpException } from '@app/classes/http.exception';
import { FileSystemController } from '@app/controllers/file-system.controller';
import { consts } from '@common/consts';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import { StatusCodes } from 'http-status-codes';
import * as path from 'path';
import * as swaggerJSDoc from 'swagger-jsdoc';
import * as swaggerUi from 'swagger-ui-express';
import { Service } from 'typedi';
import { UserFileSystemController } from './controllers/user-file-system.controller';
import { DatabaseService } from './services/database.service';
import { FriendsService } from './services/friends.service';
import { UserService } from './services/user.service';

@Service()
export class Application {
    app: express.Application;
    userService: UserService;
    private readonly internalError: number = StatusCodes.INTERNAL_SERVER_ERROR;
    private readonly swaggerOptions: swaggerJSDoc.Options;
    private readonly userFileSystemController: UserFileSystemController;
    private readonly friendsService: FriendsService;

    constructor(private readonly fileSystemController: FileSystemController, private databaseService: DatabaseService) {

        this.databaseService.start();
        this.userService = new UserService(this.databaseService);
        this.friendsService = new FriendsService(this.databaseService);
        this.userFileSystemController = new UserFileSystemController(this.userService, this.databaseService, this.fileSystemController.fileSystemService);

        this.app = express();

        this.swaggerOptions = {
            swaggerDefinition: {
                openapi: '3.0.0',
                info: {
                    title: 'Cadriciel Serveur',
                    version: '1.0.0',
                },
            },
            apis: ['**/*.ts'],
        };

        this.config();

        this.bindRoutes();
    }

    bindRoutes(): void {
        this.app.use('/api/', this.userFileSystemController.router);
        this.app.use('/friends', this.friendsService.router);
        this.app.use(`/api/${consts.FILE_SYSTEM}`, this.fileSystemController.router);
        this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(this.swaggerOptions)));

        // Expose images on the server
        const imagesPath = path.join(__dirname, '../../../avatars/');
        this.app.use('/avatars', express.static(imagesPath));

        this.app.use('/', (req, res) => {
            res.redirect('/api/docs');
        });
        this.errorHandling();
    }

    private config(): void {
        // Middlewares configuration
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ limit: '10mb', extended: true, parameterLimit: 10000 }));
        this.app.use(cookieParser());
        this.app.use(cors());
    }

    private errorHandling(): void {
        // When previous handlers have not served a request: path wasn't found
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            const err: HttpException = new HttpException('Not Found');
            next(err);
        });

        // development error handler
        // will print stacktrace
        if (this.app.get('env') === 'development') {
            this.app.use((err: HttpException, req: express.Request, res: express.Response) => {
                res.status(err.status || this.internalError);
                res.send({
                    message: err.message,
                    error: err,
                });
            });
        }

        // production error handler
        // no stacktraces  leaked to user (in production env only)
        this.app.use((err: HttpException, req: express.Request, res: express.Response) => {
            res.status(err.status || this.internalError);
            res.send({
                message: err.message,
                error: {},
            });
        });
    }
}
