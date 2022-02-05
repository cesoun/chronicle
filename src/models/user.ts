export enum UserRole {
	User = "user",
	Admin = "admin",
	Banned = "banned"
}

export interface IUser {
	id?: number;
	username?: string;
	password?: string;
	hash?: string;
	first_name?: string;
	last_name?: string;
	email?: string;
	role?: UserRole
}

export class User {
	data?: IUser;

	constructor(user?: IUser) {
		if (user) this.data = user;
	}

	
}