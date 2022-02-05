import mysql, {PoolConfig, Pool} from 'mysql';

class SQLRepository {
	private cfg?: PoolConfig
	private pool?: Pool;

	constructor() {
		console.log('new one');

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

	// TODO: Insert User
	// TODO: Get User
	// TODO: Update User
	// TODO: Delete User
}

export const repo = new SQLRepository();