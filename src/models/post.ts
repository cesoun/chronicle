export interface IPost {
	id?: number;
	author_id?: number;
	content?: string;
	created_at?: Date;
	modified_at?: Date;
}

export class Post {
	data?: IPost;
	
	constructor(post?: IPost) {
		if (post) this.data = post;
	}
}