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
			if (uqr.error) {
				return res.status(404).json(uqr);
			}

			const token: string = generateToken(uqr.user!.data!.username!);
			return res.status(200).json({ token });
		})
		.catch((ex) => {
			console.error(ex);
			return res.sendStatus(500);
		});
});

export default registerRouter;
