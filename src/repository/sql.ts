import util from 'util';
import mysql, { PoolOptions, Pool } from 'mysql2';
import { IUser, User, UserQueryResult, UserUpdateDTO } from '../models/user';
import { IPost } from '../models/post';

class SQLRepository {
	private cfg?: PoolOptions;
	private pool?: Pool;

	constructor() {
		this.cfg = {
			connectionLimit: 10,
			host: process.env.MYSQL_HOST,
			port: Number(process.env.MYSQL_PORT),
			user: process.env.MYSQL_USER,
			password: process.env.MYSQL_PASS,
			database: process.env.MYSQL_DATABASE,
		};

		this.pool = mysql.createPool(this.cfg);
	}

	/**
	 * Create's a user within the database, rejects with an error if one occurs
	 * @param user User containing the username, password, email and role
	 * @returns Promise<UserQueryResult>
	 */
	createUser(user: IUser): Promise<UserQueryResult> {
		return new Promise(async (resolve, reject) => {
			const u: User = new User(user);
			let uqr: UserQueryResult = {};

			// hash password and attempt to insert.
			await u
				.hashPassword()
				.then(() => {
					this.pool!.getConnection(async (err, conn: any) => {
						if (err) {
							return reject(err);
						}

						conn.query = util.promisify(conn.query);

						const query: string = `INSERT INTO users (username, hash, email, role) VALUES (?, ?, ?, ?)`;
						const values = [
							u.data?.username,
							u.data?.hash,
							u.data?.email,
							u.data?.role,
						];

						try {
							let result = await conn.query(query, values);

							if (
								!result['affectedRows'] ||
								result['affectedRows'] === 0
							) {
								uqr.error = true;
								uqr.message = 'failed to create user';

								return reject(uqr);
							}

							uqr.user = u;
							return resolve(uqr);
						} catch (ex: any) {
							uqr.error = true;

							switch (ex['code']) {
								case 'ER_DUP_ENTRY':
									uqr.message =
										'duplicate entry for: username | email';
									return resolve(uqr);
								default:
									return reject(ex);
							}
						} finally {
							conn.release();
						}
					});
				})
				.catch((err) => {
					return reject(err);
				});
		});
	}

	/**
	 * Attempts to find a User in the database for a given Username
	 * @param user IUser containing the username to look for
	 * @returns Promise<UserQueryResult>
	 */
	getUserByUsername(user: IUser): Promise<UserQueryResult> {
		return new Promise((resolve, reject) => {
			const u: User = new User(user);
			let uqr: UserQueryResult = {};

			this.pool?.getConnection(async (err, conn: any) => {
				if (err) {
					return reject(err);
				}

				conn.query = util.promisify(conn.query);

				const query: string = `SELECT * FROM users WHERE username = ? LIMIT 1`;
				const values = [u.data?.username];
				let result = await conn.query(query, values);

				if (result.length === 0) {
					uqr.error = true;
					uqr.message = 'no user found for given username';

					return resolve(uqr);
				}

				conn.release();

				uqr.user = new User(result[0]);
				return resolve(uqr);
			});
		});
	}

	/**
	 * Attempts to delete a User from the database
	 * @param user IUser containing the username of the User to try and delete
	 * @returns Promise<UserQueryResult>
	 */
	deleteUserByUsername(user: IUser): Promise<UserQueryResult> {
		return new Promise((resolve, reject) => {
			const u: User = new User(user);
			let uqr: UserQueryResult = {};

			this.pool?.getConnection(async (err, conn: any) => {
				if (err) {
					return reject(err);
				}

				conn.query = util.promisify(conn.query);

				const query: string = `DELETE FROM users WHERE username = ?`;
				const values = [u.data?.username];
				let result = await conn.query(query, values);

				if (!result['affectedRows'] || result['affectedRows'] === 0) {
					uqr.error = true;
					uqr.message = 'could not find user to delete';

					return resolve(uqr);
				}

				conn.release();

				return resolve(uqr);
			});
		});
	}

	/**
	 * Attempts to update a User with the supplied Fields
	 * @param user User to update
	 * @param fields Fields to update on the User
	 * @returns Promse<UserQueryResult>
	 */
	updateUser(user: User, fields: UserUpdateDTO): Promise<UserQueryResult> {
		return new Promise((resolve, reject) => {
			let uqr: UserQueryResult = {};

			if (!user.data?.username) {
				uqr.error = true;
				uqr.message = 'missing field username, internal error?';

				return reject(uqr);
			}

			this.pool?.getConnection(async (err, conn: any) => {
				if (err) {
					return reject(err);
				}

				conn.query = util.promisify(conn.query);

				// Build the Query
				let query: string = `UPDATE users SET `;
				for (const [k, v] of Object.entries(fields)) {
					if (k === 'password') {
						user.data!.password = fields.password;
						await user
							.hashPassword()
							.then((hash) => {
								query += `hash='${hash}', `;
							})
							.catch((ex) => {
								return reject(ex);
							});
					} else {
						query += `${k}='${v}', `;
					}
				}
				query = query.substring(0, query.length - 2);
				query += ` WHERE username='${user.data!.username}'`;

				try {
					let result = await conn.query(query);

					if (
						!result['affectedRows'] ||
						result['affectedRows'] === 0
					) {
						uqr.error = true;
						uqr.message = 'failed to update user';

						return reject(uqr);
					}

					// Update he user data with the new fields.
					Object.keys(fields).forEach((key) => {
						(user.data as any)[key] = (fields as any)[key];
					});

					// set and return it.
					uqr.user = user;
					return resolve(uqr);
				} catch (ex: any) {
					uqr.error = true;

					switch (ex['code']) {
						case 'ER_DUP_ENTRY':
							uqr.message =
								'duplicate entry for: username | email';
							return resolve(uqr);
						default:
							return reject(ex);
					}
				} finally {
					conn.release();
				}
			});
		});
	}
}

export const repo = new SQLRepository();
