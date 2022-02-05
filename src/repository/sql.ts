import util from 'util';
import mysql, { PoolOptions, Pool } from 'mysql2';
import { IUser, User, UserQueryResult } from '../models/user';
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

			// hash password and attempt to insert.
			await u
				.hashPassword()
				.then(() => {
					let uqr: UserQueryResult = {};

					const query: string = `INSERT INTO users (username, hash, email, role) VALUES (?, ?, ?, ?)`;
					const values = [
						u.data?.username,
						u.data?.hash,
						u.data?.email,
						u.data?.role,
					];

					this.pool!.query(query, values, (err, result, fields) => {
						if (err) {
							return reject(err);
						}

						uqr.user = u;
						return resolve(uqr);
					});
				})
				.catch((err) => {
					return reject(err);
				});
		});
	}

	/**
	 * Attempts to find a User in the database for a given Username
	 * @param user User containing the username to look for
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

				uqr.user = new User(result[0]);
				return resolve(uqr);
			});
		});
	}
}

export const repo = new SQLRepository();
