import { Router, Request, Response, NextFunction } from 'express';
import { IUser } from '../models/user';
import { generateToken } from '../middleware/jwt';
import { repo } from '../repository/sql';
import { RequestErrorResponse } from '../util/errors';
const loginRouter = Router();

/* POST /login */
loginRouter.post('/', (req: Request, res: Response, next: NextFunction) => {
	if (!req.body['username'] || !req.body['password']) {
		let err: RequestErrorResponse = {
			error: true,
			message: 'missing required fields: username | password',
		};

		return res.status(404).json(err);
	}

	const { username, password } = req.body;
	const user: IUser = { username, password };

	repo.getUserByUsername(user)
		.then((uqr) => {
			if (uqr.error) {
				return res.status(404).json(uqr);
			}

			if (!uqr.user || !uqr.user.data) {
				return res.sendStatus(500);
			}

			// set the password from to one stored on user from request.body
			uqr.user.data.password = user.password;

			// verify
			uqr.user.verifyPassword().then((verified) => {
				if (!verified) {
					let err: RequestErrorResponse = {
						error: true,
						message: 'bad username or password combination',
					};

					return res.status(404).json(err);
				}

				if (!uqr.user || !uqr.user.data || !uqr.user.data.username) {
					let err: RequestErrorResponse = {
						error: true,
						message: 'an internal server error occurred',
					};

					console.error(uqr, 'missing user from select');
					return res.status(500).json(err);
				}

				const token: string = generateToken(uqr.user.data.username);
				return res.status(200).json({ token });
			});
		})
		.catch((ex) => {
			console.log(ex, 'login error');
			return res.sendStatus(500);
		});
});

export default loginRouter;
