import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { User } from '../models/user';
import { IPost, Post } from '../models/post';
import { repo } from '../repository/sql';
import { RequestErrorResponse } from '../util/errors';
const postRouter = Router();

/* POST /post */
postRouter.post(
	'/',
	passport.authenticate('jwt', { session: false }),
	(req: Request, res: Response, next: NextFunction) => {
		const user: User = req.user as User;
		const post: IPost = req.body as IPost;

		repo.createPost(user, post)
			.then((pqr) => {
				if (pqr.error) {
					return res.status(404).json(pqr);
				}

				return res.status(200).json(pqr.post?.toPostDTO());
			})
			.catch((ex) => {
				console.error(ex);
				return res.sendStatus(500);
			});
	}
);

/* GET /post/:id */
postRouter.get('/:id', (req: Request, res: Response, next: NextFunction) => {
	const id: number = parseInt(req.params['id']);
	if (isNaN(id)) {
		let err: RequestErrorResponse = {
			error: true,
			message: `'${req.params['id']}' is not a valid post id`,
		};

		return res.status(404).json(err);
	}

	repo.getPostById(id)
		.then((pqr) => {
			if (pqr.error) {
				return res.status(404).json(pqr);
			}

			return res.status(200).json(pqr.post?.toPostDTO());
		})
		.catch((ex) => {
			console.error(ex);
			return res.sendStatus(500);
		});
});

/* PUT /post/:id */
postRouter.put(
	'/:id',
	passport.authenticate('jwt', { session: false }),
	(req: Request, res: Response, next: NextFunction) => {
		return res.sendStatus(501);
	}
);

/* DELETE /post/:id */
postRouter.delete(
	'/:id',
	passport.authenticate('jwt', { session: false }),
	(req: Request, res: Response, next: NextFunction) => {
		return res.sendStatus(501);
	}
);

export default postRouter;
