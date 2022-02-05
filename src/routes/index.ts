import { Router, Request, Response, NextFunction } from 'express';
const indexRouter = Router();

/* GET / */
indexRouter.get(
	'/',
	function (req: Request, res: Response, next: NextFunction) {
		res.sendStatus(204);
	}
);

export default indexRouter;
