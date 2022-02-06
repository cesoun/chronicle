export interface IPost {
	id?: number;
	author_id?: number;
	title?: string;
	content?: string;
	created_at?: Date;
	modified_at?: Date;
}

export interface PostDTO {
	author?: string;
	author_first?: string;
	author_last?: string;
	title?: string;
	content?: string;
	created_at?: Date;
	modified_at?: Date;
}

export interface PostUpdateDTO {
	title?: string;
	content?: string;
	created_at?: Date;
	modified_at?: Date;
}

export interface PostQueryResult {
	error?: boolean;
	message?: string;
	post?: Post;
}

export class Post {
	data?: IPost;

	constructor(post?: IPost) {
		if (post) this.data = post;
	}

	toPostDTO(): PostDTO {
		let dto: PostDTO = {};

		return dto;
	}

	toPostUpdateDTO(): PostUpdateDTO {
		let dto: PostUpdateDTO = {};

		return dto;
	}
}
