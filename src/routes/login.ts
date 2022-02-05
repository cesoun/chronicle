import {Router, Request, Response, NextFunction} from 'express';
const loginRouter = Router();

// Middleware
import passport from 'passport';
import { IUser } from '../models/user';
import { generateToken } from '../middleware/jwt';
import { repo } from '../repository/sql';
import { RequestErrorResponse } from '../util/errors';

/* POST /login */
loginRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
	const user: IUser = {
		username: 'username',
		password: 'password',
		email: 'christopher@heckin.dev'
	};

	if (!req.body['username'] || !req.body['password']) {
		let err: RequestErrorResponse = {
			error: true,
			message: 'missing required fields: username | password'
		}

		return res.status(404).json(err)
	}

	repo.getUserById(1).then(result => {
		const token = generateToken(user);
		res.status(200).json({ token });
	}).catch(ex => {
		console.error(ex)
		res.sendStatus(500);
	})
});

/* PUT /login */
loginRouter.put(
	'/',
	passport.authenticate('jwt', { session: false }),
	async (req: Request, res: Response, next: NextFunction) => {

		if (!req.body['password'] || !req.body['new']) {
			let err: RequestErrorResponse = {
				error: true,
				message: 'missing required fields: username | password'
			}
	
			return res.status(404).json(err)
		}

		const {username, password, email} = req.body['new'];

		if (!username && !password && !email) {
			let err: RequestErrorResponse = {
				error: true,
				message: 'missing all fields, at least one is required: username | password | email'
			}
	
			return res.status(404).json(err)
		}

		res.sendStatus(501);
	}
);

export default loginRouter;