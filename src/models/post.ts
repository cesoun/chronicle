export interface IPost {
	id?: number;
	author_id?: number;
	title?: string;
	content?: string;
	created_at?: Date;
	modified_at?: Date;
}

export interface PostDTO {
	id?: number;
	author?: string;
	author_first?: string;
	author_last?: string;
	title?: string;
	content?: string;
	created_at?: Date;
	modified_at?: Date;
}

export interface PostUpdateDTO {
	id?: number;
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
		const { title, content, id } = this.data!;
		let dto: PostDTO = { title, content, id };

		return dto;
	}

	toPostUpdateDTO(): PostUpdateDTO {
		let dto: PostUpdateDTO = { ...this.data };
		return dto;
	}
}
