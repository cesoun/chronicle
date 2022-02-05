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

export interface UserQueryResult {
	error?: boolean;
	message?: string;
	user?: User;
}

export class User {
	data?: IUser;

	constructor(user?: IUser) {
		if (user) this.data = user;
	}

	// TODO: Hash / Salt / Verify
}