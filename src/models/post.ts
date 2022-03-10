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

export interface MultiplePostQueryResult {
	error?: boolean;
	message?: string;
	posts?: Post[];
	pagination?: PostPagination;
}

export interface PostPagination {
	page?: number; // The current page
	limit?: number; // The limit
	pages?: number; // The total pages based on the offset
}

export class Post {
	data?: IPost;

	constructor(post?: IPost) {
		if (post) this.data = post;
	}

	toPostDTO(): PostDTO {
		const { title, content, id, created_at, modified_at } = this.data!;
		let dto: PostDTO = { title, content, id, created_at, modified_at };

		return dto;
	}

	toPostUpdateDTO(): PostUpdateDTO {
		const { title, content, id, created_at, modified_at } = this.data!;
		let dto: PostUpdateDTO = {
			title,
			content,
			id,
			created_at,
			modified_at,
		};
		return dto;
	}
}
