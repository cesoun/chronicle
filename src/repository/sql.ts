import util from 'util'
import mysql, {PoolOptions, Pool} from 'mysql2';
import { IUser, UserQueryResult } from '../models/user';
import { IPost } from '../models/post';

class SQLRepository {
	private cfg?: PoolOptions
	private pool?: Pool;

	constructor() {
		this.cfg = {
			connectionLimit: 10,
			host: process.env.MYSQL_HOST,
			port: Number(process.env.MYSQL_PORT),
			user: process.env.MYSQL_USER,
			password: process.env.MYSQL_PASS,
			database: process.env.MYSQL_DATABASE
		}

		this.pool = mysql.createPool(this.cfg)
	}

	async getUserById(id: number): Promise<UserQueryResult> {
		return new Promise((resolve, reject) => {
			let query: string = `SELECT * FROM users WHERE id = ?`


			this.pool?.query(query, [id], (err, rows, fields) => {
				if (err) {
					return reject(err)
				}

				console.log(rows);
				let queryResult: UserQueryResult = {};
				resolve(queryResult)
			})
		});
	}
	// TODO: Insert User
	// TODO: Get User
	// TODO: Update User
	// TODO: Delete User
}

export const repo = new SQLRepository();