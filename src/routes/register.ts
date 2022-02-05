import {Router, Request, Response, NextFunction} from 'express'
const registerRouter = Router();

/* POST /register */
registerRouter.post('/', (req: Request, res: Response, next: NextFunction) => {
	res.sendStatus(501);
});

export default registerRouter;
