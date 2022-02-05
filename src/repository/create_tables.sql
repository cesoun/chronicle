create table users
(
    id         int auto_increment
        primary key,
    username   varchar(16)                                     not null,
    hash       varchar(255)                                    not null,
    first_name varchar(255)                                    null,
    last_name  varchar(255)                                    null,
    email      varchar(255)                                    not null,
    role       enum ('user', 'admin', 'banned') default 'user' not null,
    constraint users_email_uindex
        unique (email),
    constraint users_username_uindex
        unique (username)
);

create table posts
(
    id          int auto_increment
        primary key,
    author_id   int                                 null,
    title       varchar(255)                        not null,
    content     text                                not null comment 'content is unsanitized markdown',
    modified_at timestamp                           null on update CURRENT_TIMESTAMP,
    created_at  timestamp default CURRENT_TIMESTAMP not null,
    constraint posts_users_id_fk
        foreign key (author_id) references users (id)
            on delete cascade
);

