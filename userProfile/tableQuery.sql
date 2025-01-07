
CREATE TABLE Users (
	id INTEGER NOT NULL PRIMARY KEY,
	auth0Indetyfier TEXT NOT NULL,
	nickname TEXT,
	email TEXT,
	picture TEXT,
	CO2Prevented REAL
);

CREATE TABLE Friend_groups(
	id INTEGER NOT NULL PRIMARY KEY,
	name TEXT
);

CREATE TABLE Friend_groups_to_users(
	user_id INTEGER NOT NULL,
	friend_group_id INTEGER NOT NULL,
	PRIMARY KEY (user_id, friend_group_id),
	FOREIGN KEY (user_id) REFERENCES Users(id),
	FOREIGN KEY (friend_group_id) REFERENCES Friend_goups(id)

);

CREATE TABLE Recipes(
	id INTEGER NOT NULL PRIMARY KEY,
	user_id INTEGER NOT NULL,
	name TEXT,
	image_path TEXT,
	total_calories REAL,
	total_protein REAL,
	total_carbs REAL,
	total_fats REAL,
	FOREIGN KEY (user_id) REFERENCES Users(id)
);



CREATE TABLE Ingredients(
	id INTEGER NOT NULL PRIMARY KEY,
	name TEXT NOT NULL,
	amount REAL
);


CREATE TABLE Ingredients_to_recipes(
	ingredient_id INTEGER NOT NULL,
	recipe_id INTEGER NOT NULL,
	prevented_emission REAL,
	PRIMARY KEY (ingredient_id,recipe_id),
	FOREIGN KEY (ingredient_id) REFERENCES Ingredients(id) ON DELETE CASCADE,
	FOREIGN KEY (recipe_id) REFERENCES Recipes(id) ON DELETE CASCADE
);





CREATE TABLE Tags(
	id INTEGER NOT NULL PRIMARY KEY,
	user_id INTEGER NOT NULL,
	name TEXT NOT NULL,
	color TEXT NOT NULL,
	FOREIGN KEY (user_id) REFERENCES Users(id)
);


CREATE TABLE Recipes_to_tags(
	recipe_id INTEGER NOT NULL,
	tag_id INTEGER NOT NULL,
	PRIMARY KEY (recipe_id,tag_id),
	FOREIGN KEY (recipe_id) REFERENCES Recipes(id),
	FOREIGN KEY (tag_id) REFERENCES Tags(id) ON DELETE CASCADE
);

CREATE TABLE Diatery_diary(
	date TEXT NOT NULL,
	user_id INTEGER NOT NULL,
	total_calories REAL,
	total_protein REAL,
	total_carbs REAL,
	total_fats REAL,
	emission REAL,
	PRIMARY KEY (user_id,date),
	FOREIGN KEY (user_id) REFERENCES Users(id)
);



