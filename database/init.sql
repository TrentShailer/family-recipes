set time zone 'UTC';
create table if not exists "users" (
	"id" uuid primary key default gen_random_uuid(),
	"name" varchar not null unique,
	"password" varchar not null
);
create table if not exists "recipe_books" (
	"id" uuid primary key default gen_random_uuid(),
	"name" varchar not null unique,
	"password" varchar not null
);
create table if not exists "recipes" (
	"id" uuid primary key default gen_random_uuid(),
	"recipe_book_id" uuid not null references "recipe_books"("id") on delete cascade,
	"name" varchar not null,
	"time" integer not null,
	"servings" integer not null,
	"ingredients" json [] not null,
	"steps" varchar [] not null,
	"author" varchar not null,
	"notes" varchar,
	"created_at" timestamptz not null default NOW()
);
create table if not exists "comments" (
	"id" uuid primary key default gen_random_uuid(),
	"user_id" uuid not null references "users"("id") on delete cascade,
	"recipe_id" uuid not null references "recipes"("id") on delete cascade,
	"comment" varchar not null,
	"created_at" timestamptz not null default NOW()
);
create table if not exists "book_editors" (
	"id" uuid primary key default gen_random_uuid(),
	"user_id" uuid not null references "users"("id") on delete cascade,
	"recipe_book_id" uuid not null references "recipe_books"("id") on delete cascade,
	unique("user_id", "recipe_book_id")
);
create table if not exists "favourites" (
	"id" uuid primary key default gen_random_uuid(),
	"user_id" uuid not null references "users"("id") on delete cascade,
	"recipe_id" uuid not null references "recipes"("id") on delete cascade,
	unique("user_id", "recipe_id")
);
create table if not exists "notes" (
	"id" uuid primary key default gen_random_uuid(),
	"user_id" uuid not null references "users"("id") on delete cascade,
	"recipe_id" uuid not null references "recipes"("id") on delete cascade,
	"note" varchar not null,
	unique("user_id", "recipe_id")
);
create table if not exists "tags" (
	"id" uuid primary key default gen_random_uuid(),
	"recipe_id" uuid not null references "recipes"("id") on delete cascade,
	"tag" varchar not null
);
