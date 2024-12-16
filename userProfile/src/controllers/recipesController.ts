import { Request, Response } from "express";
import sqlite3 from "sqlite3";
import dotenv from "dotenv";
import z, { date } from "zod";
import {
	createIntegerSchema,
	formatZodErrors,
	createArraySchema,
} from "../helpers/zodHelpers";

// Open sqlite in verbose for better error tracing if the app is in debug mode
const sqlite = process.env.DEBUG === "TRUE" ? sqlite3.verbose() : sqlite3;


// todo: sending or evne returning after status(500) doesn't stop execution for some reason
// Retrieve all recipes for a user
export async function getRecipes(req: Request, res: Response) {

	// Connect to the database
	const db = new sqlite.Database("./db.sqlite3", (err: any) => {
		if (err) {
			console.log("opening error: ", err);
			// If databased failed to open the Api is unoperable
			res.status(500).send();
		}
	});

	const user_id = req.user_id;

	const getQuery = `SELECT * FROM Recipes
	WHERE user_id = ?`;

	// todo: add pagination
	db.all(getQuery, [user_id], (err: any, rows: string | any[]) => {
		if (err) {
			console.log(err);
			res.status(500).send();
		}
		if (rows.length === 0) {
			res.status(200).json([]);
		}else{
			res.status(200).json(rows);
		}
	});
	db.close();
}

// Retrieve a single recipe
export async function getRecipe(req: Request, res: Response) {
	// Connect to the database
	const db = new sqlite.Database("./db.sqlite3", (err: any) => {
		if (err) {
			console.log("opening error: ", err);
			// If databased failed to open the Api is unoperable
			res.status(500).send();
		}
	});

	const user_id = parseInt(req.user_id);

	// Retrieve the recipe_id from the request
	const receipe_id = req.params.recipe_id;

	const getQuery = `SELECT * FROM Recipes
	WHERE id = ? AND user_id = ?`;

	db.get(getQuery, [receipe_id, user_id], (err: any, row: any) => {
		if (err) {
			console.log(err);
			res.status(500).send();
		}
		if (!row) {
			res.status(404).send("Recipe not found");
		}
		res.status(200).json(row);
	});
	db.close();
}



export async function createRecipe(req: Request, res: Response) {
	// Connect to the database
	const db = new sqlite.Database("./db.sqlite3", (err: any) => {
		if (err) {
			console.log("opening error: ", err);
			// If databased failed to open the Api is unoperable
			res.status(500).send();
		}
	});

	console.log("req ", req.user_id);

	const user_id = parseInt(req.user_id);

	console.log("req parsed ",user_id);
	
	// Type checking received data provide null for empty values
	const recipeSchema = z.object({
		name: z.string(),
		image_path: z.string().nullable().default(null),
	});

	const parsed = recipeSchema.safeParse(req.body);

	if (parsed.error) {
		// parse zod errors into user friendly format
		const errors_messages = formatZodErrors(parsed.error.issues);
		res.status(400).json(errors_messages);
		return;
	}

	const insertQuery = `
		INSERT INTO Recipes 
		(user_id,name,image_path,total_calories,total_protein,
		total_carbs,total_fats)
		VALUES (?,?,?,?,?,?,?)
	`;

	db.serialize(() => {
		db.run(insertQuery, [user_id,parsed.data.name,parsed.data.image_path,0,0,0,0]);
	});

	res.status(200).send();
	db.close();
}
// todo : provide option to update image_path and nutrition values
export function updateRecipe(req: Request, res: Response) {
	// Connect to the database
	const db = new sqlite.Database("./db.sqlite3", (err: any) => {
		if (err) {
			console.log("opening error: ", err);
			// If databased failed to open the Api is unoperable
			res.status(500).send();
		}
	});
	// Retrieve the recipe_id from the request
	const receipe_id = req.params.recipe_id;


	
	const user_id = parseInt(req.user_id);
	// Type checking received data 
	const updateSchema = z.object({
		name: z.string().optional(),
		to_delete: createArraySchema().optional(),
		to_add: createArraySchema().optional(),
	});

	// Type checking forqueried data
	const ingriedentsSchema = z.object({
		ingredients: createArraySchema().nullable(),
	});

	const parsed = updateSchema.safeParse(req.body);

	if (parsed.error) {
		// parse zod errors into user friendly format
		const errors_messages = formatZodErrors(parsed.error.issues);
		res.status(400).json(errors_messages);
		return;
	}




	// SQL queries to update the recipe

	const nameUpdateQuery = `
		UPDATE Recipes
		SET name = ?
		WHERE id = ? and user_id = ?
	`;

	const ingredientsUpdateQuery = `
		UPDATE Recipes
		SET ingredients = ?
		WHERE id = ? and user_id = ?

	`;

	const checkQuery = `
		SELECT * FROM Recipes
		WHERE id = ? and user_id = ?

	`;

	const ingredientsQuery = `
		SELECT ingredients FROM recipes
		WHERE id = ? and user_id = ?

	`;

	db.serialize(() => {
		// validate if recipe_id exists
<<<<<<< HEAD
		db.get(checkQuery, [receipe_id,user_id], (err, row) => {
=======
		db.get(checkQuery, [receipe_id], (err: any, row: any) => {
>>>>>>> 27ba444103043312bd0c76b31c595d9c7c1813f5
			if (err) {
				console.log(err);
				res.status(500).send();
			}
			if (!row) {
				res.status(404).send("Recipe not found or invalid id");
			}
			// todo: validate if user is authorized to update this recipe
		});

		db.parallelize(() => {
			if (parsed.data.name) {
				db.run(
					nameUpdateQuery,
<<<<<<< HEAD
					[parsed.data.name, receipe_id,user_id],
					(err) => {
=======
					[parsed.data.name, receipe_id],
					(err: any) => {
>>>>>>> 27ba444103043312bd0c76b31c595d9c7c1813f5
						if (err) {
							console.log(err);
							res.status(500).send();
						}
					}
				);
			}
			db.serialize(() => {
				console.log(parsed.data);
				if (
					parsed.data.to_delete !== undefined ||
					parsed.data.to_add !== undefined
				) {
					console.log("updating ingredients");
					// retrieve the current ingredients
<<<<<<< HEAD
					db.get(ingredientsQuery, [receipe_id,user_id], (err, row) => {
=======
					db.get(ingredientsQuery, [receipe_id], (err: any, row: any) => {
>>>>>>> 27ba444103043312bd0c76b31c595d9c7c1813f5
						if (err) {
							console.log(err);
							res.status(500).send();
						}
						const parsedQuery = ingriedentsSchema.safeParse(row);
						if (!parsedQuery.success) {
							//todo: investigate why this is happening
							//doesn't actually send the error message
							console.log('error: ',parsedQuery.error);
							res.status(500).send();
							return;
						}

						let currentIngredients =
							parsedQuery.data.ingredients === null
								? []
								: parsedQuery.data.ingredients;
						// remove the ingredients that are marked to be deleted
						if (parsed.data.to_delete !== undefined) {
							parsed.data.to_delete.forEach((ingredient: any) => {
								const index =
									currentIngredients.indexOf(ingredient);
								if (index > -1) {
									currentIngredients.splice(index, 1);
								}
							});
							// add the ingredients that are marked to be added
						}
						if (parsed.data.to_add !== undefined) {
							//check if the ingredient is already in the list
							//if not add it after surruonding it with ""
							parsed.data.to_add.forEach((ingredient: any) => {
								if (!currentIngredients.includes(ingredient)) {
									currentIngredients.push(ingredient);
								}
							});
						}

						currentIngredients = currentIngredients.map((ingredient: any) => {
							return `"${ingredient}"`;
						});
						// update the ingredients
						db.run(
							ingredientsUpdateQuery,
							[
								"[" + currentIngredients.join(",") + "]",
								receipe_id,
								user_id,
							],
							(err: any) => {
								if (err) {
									console.log(err);
									res.status(500).send();
								}
							}
						);
					});
				}
			});
		});
	});

	res.status(200).send();
}
export async function deleteRecipe(req : Request, res: Response){
	// Connect to the database
	const db = new sqlite.Database("./db.sqlite3", (err: any) => {
		if (err) {
			console.log("opening error: ", err);
			// If databased failed to open the Api is unoperable
			res.status(500).send();
		}
	});

	// Retrieve the recipe_id from the request
	const receipe_id = req.params.recipe_id;

	const user_id = parseInt(req.user_id);

	const deleteQuery = `
		DELETE FROM Recipes
		WHERE id = ? AND user_id = ?
	`;


	db.serialize(() => {
<<<<<<< HEAD
		db.run(deleteQuery, [receipe_id, user_id], (err) => {
=======
		//todo: validate if user is authorized to delete this recipe
		db.run(deleteQuery, [receipe_id], (err: any) => {
>>>>>>> 27ba444103043312bd0c76b31c595d9c7c1813f5
			if (err) {
				console.log(err);
				res.status(500).send();
			}
		});
	});
	return res.status(200).send();
}