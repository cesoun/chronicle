import { Router, Request, Response, NextFunction } from 'express';
import { RequestErrorResponse } from '../util/errors';
import { repo } from '../repository/sql';
import { IUser } from '../models/user';
const userRouter = Router();

/* GET /user/:username */
userRouter.get(
	'/:username',
	(req: Request, res: Response, next: NextFunction) => {
		const { username } = req.params;
		if (!username) {
			let err: RequestErrorResponse = {
				error: true,
				message: 'missing required param: username',
			};

			return res.status(404).json(err);
		}

		let user: IUser = { username };

		repo.getUserByUsername(user)
			.then((uqr) => {
				if (uqr.error) {
					return res.status(404).json(uqr);
				}

				if (!uqr.user || !uqr.user.data) {
					return res.sendStatus(500);
				}

				return res.status(200).json(uqr.user.toUserDTO());
			})
			.catch((ex) => {
				console.error(ex);
				return res.sendStatus(500);
			});
	}
);

export default userRouter;
