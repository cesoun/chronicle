import bcrypt from 'bcrypt';

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

export interface UserDTO {
	id?: number;
	username?: string;
	first_name?: string;
	last_name?: string;
	role?: UserRole;
}

export interface UserUpdateDTO {
	id?: number;
	username?: string;
	first_name?: string;
	last_name?: string;
	password?: string;
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

	toUserDTO(): UserDTO {
		const { id, username, first_name, last_name, role } = this.data!;
		const dto: UserDTO = { id, username, first_name, last_name, role };

		return dto;
	}

	toUserUpdateDTO(): UserUpdateDTO {
		const { id, username, first_name, last_name, email, role } = this.data!;
		const dto: UserUpdateDTO = {
			id,
			username,
			first_name,
			last_name,
			email,
			role,
		};

		return dto;
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
