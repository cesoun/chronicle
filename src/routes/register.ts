import { Router, Request, Response, NextFunction } from 'express';
const registerRouter = Router();
import { RequestErrorResponse } from '../util/errors';
import { repo } from '../repository/sql';
import { generateToken } from '../middleware/jwt';

/* POST /register */
registerRouter.post('/', (req: Request, res: Response, next: NextFunction) => {
	if (!req.body) {
		let err: RequestErrorResponse = {
			error: true,
			message: 'empty request body',
		};

		return res.status(404).json(err);
	}

	const { username, password, email } = req.body;
	if (!username || !password || !email) {
		let err: RequestErrorResponse = {
			error: true,
			message:
				'missing one or more required fields: username | password | email',
		};

		return res.status(404).json(err);
	}

	repo.createUser({ username, password, email })
		.then((uqr) => {
			if (!uqr.user || !uqr.user.data || !uqr.user.data.username) {
				let err: RequestErrorResponse = {
					error: true,
					message: 'an internal server error occurred',
				};

				console.error(uqr, 'missing user from insert');
				return res.status(500).json(err);
			}

			const token: string = generateToken(uqr.user.data.username);
			return res.status(200).json({ token });
		})
		.catch((ex) => {
			let err: RequestErrorResponse = {
				error: true,
				message: '',
			};

			switch (ex['code']) {
				case 'ER_DUP_ENTRY':
					err.message = 'duplicate entry for: username | email';
					return res.status(404).json(err);
				default:
					console.error(ex);
					err.message = 'an internal server error has occurred';
					return res.status(500).json(err);
			}
		});
});

export default registerRouter;
