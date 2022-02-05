import bcrypt from 'bcrypt';
import { RowDataPacket } from 'mysql2';

export enum UserRole {
	User = 'user',
	Admin = 'admin',
	Banned = 'banned',
}

export interface IUser {
	id?: number;
	username?: string;
	password?: string;
	hash?: string;
	first_name?: string;
	last_name?: string;
	email?: string;
	role?: UserRole;
}

export interface UserQueryResult {
	error?: boolean;
	message?: string;
	user?: User;
}

export class User {
	data?: IUser;

	constructor(user?: IUser) {
		if (user) this.data = user;
		if (!this.data?.role) this.data!.role = UserRole.User;
	}

	async hashPassword(): Promise<string> {
		return new Promise(async (resolve, reject) => {
			if (!this.data) {
				return reject('no user supplied');
			}

			if (!this.data.password) {
				return reject('no password found on user');
			}

			const salt = await bcrypt.genSalt();
			const hash = await bcrypt.hash(this.data.password, salt);
			this.data.hash = hash;

			resolve(hash);
		});
	}

	async verifyPassword(): Promise<boolean> {
		return new Promise(async (resolve, reject) => {
			if (!this.data || !this.data.password || !this.data.hash) {
				return reject(false);
			}
			const valid = await bcrypt.compare(
				this.data.password,
				this.data.hash
			);
			return resolve(valid);
		});
	}
}
