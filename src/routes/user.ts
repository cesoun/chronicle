import { Router, Request, Response, NextFunction } from 'express';
import { RequestErrorResponse } from '../util/errors';
import { repo } from '../repository/sql';
import { IUser, UserRole } from '../models/user';
import passport from 'passport';
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

/* DELETE /user/:username */
userRouter.delete(
	'/:username',
	passport.authenticate('jwt', { session: false }),
	(req: Request, res: Response, next: NextFunction) => {
		const user: any = req.user;
		const { username, role } = user['data'];
		const target = req.params.username;

		// only allow delete self, unless admin
		if (username === target || role === UserRole.Admin) {
			const userToDelete: IUser = { username: target };

			repo.deleteUserByUsername(userToDelete)
				.then((uqr) => {
					if (uqr.error) {
						return res.status(404).json(uqr);
					}

					return res.sendStatus(204);
				})
				.catch((ex) => {
					console.error(ex);
					return res.sendStatus(500);
				});
		} else {
			return res.sendStatus(401);
		}
	}
);

export default userRouter;
