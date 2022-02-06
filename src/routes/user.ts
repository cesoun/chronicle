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

		// Verify fields
		const password = req.body['password'];
		const fields = req.body['new'] as UserUpdateDTO;

		// Determine if we are allowed to discard the password field.
		if (!password) {
			let err: RequestErrorResponse = {
				error: true,
				message: 'missing required field: password',
			};

			// if target is self
			if (username === target) {
				return res.status(404).json(err);
			} else {
				// target is someone else
				if (role !== UserRole.Admin) {
					return res.sendStatus(401);
				}
			}
		}

		// Check that we got fields
		if (!fields) {
			let err: RequestErrorResponse = {
				error: true,
				message: 'missing required field: new',
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

		if (username === target) {
			// Target is self, verify password & update them.
			user.data!.password = password;
			user.verifyPassword()
				.then((verified) => {
					if (verified) {
						repo.updateUser(user, fields)
							.then((uqr) => {
								if (uqr.error) {
									return res.status(404).json(uqr);
								}

								return res
									.status(200)
									.json(uqr.user?.toUserUpdateDTO());
							})
							.catch((ex) => {
								console.error(ex, 'verification failed');
								return res.sendStatus(500);
							});
					} else {
						let err: RequestErrorResponse = {
							error: true,
							message: 'supplied password did not match',
						};

						return res.status(401).json(err);
					}
				})
				.catch((ex) => {
					console.error(
						ex,
						'failed to verify password in user update'
					);
					return res.sendStatus(500);
				});
		} else if (role === UserRole.Admin) {
			// TODO: Update other as Admin
			res.sendStatus(501);
		} else {
			res.sendStatus(401);
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
