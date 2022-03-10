import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { User, UserRole } from '../models/user';
import { IPost, Post, PostUpdateDTO } from '../models/post';
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

postRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
	// Extract query params
	const { page, limit, orderby } = req.query;

	let p: number = parseInt(page as string);
	let l: number = parseInt(limit as string);
	let ob: string = orderby as string; // This one is evil, handling it in sql instead.

	// Cleanup limits
	if (!p || p <= 0) p = 1;
	if (!l || l <= 0 || l > 25) l = 10;

	repo.getPosts(p, l, ob ? ob : 'desc')
		.then((mpqr) => {
			if (mpqr.error) {
				return res.status(404).json(mpqr);
			}

			return res.status(200).json(mpqr);
		})
		.catch((ex) => {
			console.error(ex);
			return res.sendStatus(500);
		});
});

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
		const user: User = req.user as User;
		const id: number = parseInt(req.params['id']);
		if (isNaN(id)) {
			let err: RequestErrorResponse = {
				error: true,
				message: `'${req.params['id']}' is not a valid post id`,
			};

			return res.status(404).json(err);
		}

		const { title, content } = req.body;
		if (!title && !content) {
			let err: RequestErrorResponse = {
				error: true,
				message: `missing at least one required field: title | content`,
			};

			return res.status(404).json(err);
		}

		const fields: PostUpdateDTO = { title, content, id };

		// determine if the post exists
		repo.getPostById(id)
			.then((pqr) => {
				if (pqr.error) {
					return res.status(404).json(pqr);
				}

				// If user owns post, or they are admin, allow delete.
				if (
					user.data?.id === pqr.post?.data?.author_id ||
					user.data?.role === UserRole.Admin
				) {
					repo.updatePostById(pqr.post!, fields)
						.then((pqr) => {
							if (pqr.error) {
								return res.status(404).json(pqr);
							}

							// TODO: modified_at remains null, need to re-retrieve the entry :)
							return res
								.status(200)
								.json(pqr.post?.toPostUpdateDTO());
						})
						.catch((ex) => {
							console.error(ex);
							return res.sendStatus(500);
						});
				} else {
					return res.sendStatus(401);
				}
			})
			.catch((ex) => {
				console.error(ex);
				return res.sendStatus(500);
			});
	}
);

/* DELETE /post/:id */
postRouter.delete(
	'/:id',
	passport.authenticate('jwt', { session: false }),
	(req: Request, res: Response, next: NextFunction) => {
		const user: User = req.user as User;
		const id: number = parseInt(req.params['id']);
		if (isNaN(id)) {
			let err: RequestErrorResponse = {
				error: true,
				message: `'${req.params['id']}' is not a valid post id`,
			};

			return res.status(404).json(err);
		}

		// determine if the post exists
		repo.getPostById(id)
			.then((pqr) => {
				if (pqr.error) {
					return res.status(404).json(pqr);
				}

				// If user owns post, or they are admin, allow delete.
				if (
					user.data?.id === pqr.post?.data?.author_id ||
					user.data?.role === UserRole.Admin
				) {
					repo.deletePostById(id)
						.then((pqr) => {
							if (pqr.error) {
								return res.status(404).json(pqr);
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
			})
			.catch((ex) => {
				console.error(ex);
				return res.sendStatus(500);
			});
	}
);

export default postRouter;
