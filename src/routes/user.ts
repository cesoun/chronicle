import { Router, Request, Response, NextFunction } from 'express';
import { RequestErrorResponse } from '../util/errors';
import { repo } from '../repository/sql';
import { IUser, UserRole, User, UserUpdateDTO } from '../models/user';
import passport from 'passport';
const userRouter = Router();

/* GET /user/:username */
userRouter.get(
	'/:username',
	(req: Request, res: Response, next: NextFunction) => {
		const { username } = req.params;

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

/* PUT /user/:username */
userRouter.put(
	'/:username',
	passport.authenticate('jwt', { session: false }),
	(req: Request, res: Response, next: NextFunction) => {
		const user: User = req.user as User;
		const { username, role } = user.data!;
		const target = req.params.username;

		// only allow self edit, unless admin
		if (username === target || role === UserRole.Admin) {
			const password = req.body['password'];
			const fields = req.body['new'] as UserUpdateDTO;

			if (!password || !fields) {
				let err: RequestErrorResponse = {
					error: true,
					message: 'missing required field: password | new',
				};

				return res.status(404).json(err);
			}

			// Only Admins can update role
			if (fields.role && role !== UserRole.Admin) {
				delete fields.role;
			}

			// Reject if every field is null
			if (Object.values(fields).every((f) => f === null)) {
				let err: RequestErrorResponse = {
					error: true,
					message:
						'missing at least one optional field: username | first_name | last_name | password | email | role',
				};

				return res.status(404).json(err);
			}

			// Verify password
			user.data!.password = password;
			user.verifyPassword()
				.then((verified) => {
					if (verified) {
						// Update User
						// Return Err / 204

						return res.sendStatus(204);
					}

					let err: RequestErrorResponse = {
						error: true,
						message: 'supplied password did not match',
					};

					return res.status(401).json(err);
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

/* DELETE /user/:username */
userRouter.delete(
	'/:username',
	passport.authenticate('jwt', { session: false }),
	(req: Request, res: Response, next: NextFunction) => {
		const user: User = req.user as User;
		const { username, role } = user.data!;
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
