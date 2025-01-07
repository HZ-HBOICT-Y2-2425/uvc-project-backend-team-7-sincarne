import { Request, Response } from "express";
import sqlite3 from "sqlite3";
import dotenv from "dotenv";
import z from "zod";
import db from "../../db";

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

	const user_id = req.user_id;

	const getQuery = `SELECT * FROM Recipes
	WHERE user_id = ? `;

	// todo: add pagination
	db.all(getQuery, [user_id], (err: any, rows: string | any[]) => {
		if (err) {
			console.log(err);
			res.status(500).send();
			return;
		}
		if (rows.length === 0) {
			res.status(200).json([]);
		} else {
			res.status(200).json(rows);
		}
	});
}

// Retrieve a single recipe
export async function getRecipe(req: Request, res: Response) {
	// Connect to the database

	const user_id = req.user_id;

	// Retrieve the recipe_id from the request
	const receipe_id = req.params.recipe_id;

	const getQuery = `SELECT * FROM Recipes
	WHERE id = ? AND user_id = ?
	`;

	const ingredientsQuery = `
		SELECT ing.name, ing.amount, Itr.prevented_emission as emission from Ingredients_to_recipes as Itr 
		JOIN Ingredients as ing on Itr.ingredient_id = ing.id
		WHERE Itr.recipe_id = ?
	`;

	db.get(getQuery, [receipe_id, user_id], (err: any, row: any) => {
		if (err) {
			console.log(err);
			res.status(500).send();
		}

		if (!row) {
			res.status(404).send("Recipe not found");
		}
		db.all(ingredientsQuery, [receipe_id], (err, ingredients) => {
			if (err) {
				console.log(err);
				res.status(500).send();
			}
			row.ingredients = ingredients;
			res.status(200).json(row);
		});
	});
}

export async function createRecipe(req: Request, res: Response) {
	// Connect to the database

	console.log("req ", req.user_id);

	const user_id = parseInt(req.user_id);

	console.log("req parsed ", user_id);

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
		db.run(insertQuery, [
			user_id,
			parsed.data.name,
			parsed.data.image_path,
			0,
			0,
			0,
			0,
		]);
	});

	res.status(200).send();
}
// todo : provide option to update image_path
export function updateRecipe(req: Request, res: Response) {
	// Connect to the database
	// Retrieve the recipe_id from the request
	const receipe_id = req.params.recipe_id;

	const user_id = parseInt(req.user_id);
	// Type checking received data
	const updateSchema = z.object({
		name: z.string().optional(),
		total_calories: createIntegerSchema().nullable().default(null),
		total_protein: createIntegerSchema().nullable().default(null),
		total_carbs: createIntegerSchema().nullable().default(null),
		total_fats: createIntegerSchema().nullable().default(null),
	});

	// Schema for the data retrieved from the database
	const retrieveSchema = z.object({
		name: z.string(),
		total_calories: z.number().nullable(),
		total_protein: z.number().nullable(),
		total_carbs: z.number().nullable(),
		total_fats: z.number().nullable(),
	});

	const parsed = updateSchema.safeParse(req.body);

	if (parsed.error) {
		// parse zod errors into user friendly format
		const errors_messages = formatZodErrors(parsed.error.issues);
		res.status(400).json(errors_messages);
		return;
	}

	// SQL queries to update the recipe

	const UpdateQuery = `
		UPDATE Recipes
		SET name = ?,
		total_calorie = ?,
		total_protein = ?,
		total_carbs = ?,
		total_fats = ?
		WHERE id = ? and user_id = ?
	`;

	const checkQuery = `
		SELECT * FROM Recipes
		WHERE id = ? and user_id = ?

	`;

	db.serialize(() => {
		// validate if recipe_id exists
		db.get(checkQuery, [receipe_id, user_id], (err, row) => {
			if (err) {
				console.log(err);
				res.status(500).send();
			}
			if (!row) {
				res.status(404).send("Recipe not found or invalid id");
			} else {
				const parsedQuery = retrieveSchema.safeParse(row);
				if (!parsedQuery.success) {
					console.log(parsedQuery.error);
					return;
				}

				const updatedData = {
					name: parsed.data.name ?? parsedQuery.data.name,
					total_calories:
						(parsed.data.total_calories ?? 0) +
						(parsedQuery.data.total_calories ?? 0),
					total_protein:
						(parsed.data.total_protein ?? 0) +
						(parsedQuery.data.total_protein ?? 0),
					total_carbs:
						(parsed.data.total_carbs ?? 0) +
						(parsedQuery.data.total_carbs ?? 0),
					total_fats:
						(parsed.data.total_fats ?? 0) +
						(parsedQuery.data.total_fats ?? 0),
				};
				db.run(UpdateQuery, [Object.values(updatedData)]);
			}
		});
	});

	res.status(200).send();
}
export async function deleteRecipe(req: Request, res: Response) {
	// Retrieve the recipe_id from the request
	const receipe_id = req.params.recipe_id;

	const user_id = parseInt(req.user_id);

	const deleteQuery = `
		DELETE FROM Recipes
		WHERE id = ? AND user_id = ?
	`;

	db.serialize(() => {
		db.run(deleteQuery, [receipe_id, user_id], (err) => {
			if (err) {
				console.log(err);
				res.status(500).send();
			}
		});
	});
	return res.status(200).send();
}

// user/recipes/:recipe_id/updateIngredient
export async function updateIngredient(req: Request, res: Response) {
	// Current authorized user
	const user = req.user_id;
	// Recipe id
	const recipe_id = req.params.recipe_id;

	const inputSchema = z.object({
		ingredient_name: z.string(),
		amount: z.number(),
	});

	const retrivialSchema = z.object({
		id: z.number(),
		name: z.string(),
		amount: z.number(),
	});

	const parsed = inputSchema.safeParse(req.body);

	if (parsed.error) {
		// parse zod errors into user friendly format
		const errors_messages = formatZodErrors(parsed.error.issues);
		res.status(400).json(errors_messages);
		return;
	}

	const recipeRetrivialQuery = `
		SELECT * FROM Recipes
		WHERE id = ? AND user_id = ?
	`;

	const ingredientsRetrivialQuery = `
		SELECT Ing.Id, Ing.name, Ing.amount FROM Ingredients_to_recipes as bridge 
		JOIN Ingredients as Ing ON bridge.ingredient_id = Ing.id
		WHERE bridge.recipe_id  = ?
	`;
	const ingredientDeletionQuery = `
		DELETE FROM Ingredients 
		WHERE id = ?
	`;
	const ingredientUpdateQuery = `
		UPDATE Ingredients SET amount = ? 
		WHERE id = ?
	`;

	db.serialize(() => {
		// Get recipe
		db.get(recipeRetrivialQuery, [recipe_id, user], (err, row) => {
			if (err) {
				// todo: maybe find another way to log errors
				console.log(err);
				res.status(500).send();
			}
			// No recipes found
			if (!row) {
				res.status(404).send(
					"The recipe you wish to add ingredients to either doesn't exists or doesn't belong to the user"
				);
			}
			// Recipe returned
			else {
				res.status(200);
				// Retrive all the ingredients attached to the recipe
				// very much could be a join query ............ 
				// todo: make it a join query
				db.all(ingredientsRetrivialQuery, recipe_id, (err, rows) => {
					if (err) {
						console.log(err);
						res.status(500).send();
						return;
					}
					// flag to check if update was successful or insertion is needed
					let flag = false;
					rows.forEach((row) => {
						// Parsed results for type safety
						const parsedQuery = retrivialSchema.safeParse(row);
						if (!parsedQuery.success) {
							console.log(err);
							res.status(500).send();
							return;
						}
						// If the ingredient is present update it's amount
						if (
							parsedQuery.data?.name ===
							parsed.data.ingredient_name
						) {
							// If the amount is 0 remove the ingredient
							if (!parsed.data.amount)
								db.run(
									ingredientDeletionQuery,
									parsedQuery.data.id
								);
							// Alternatively update the data with appropreate ammount
							else
								db.run(
									ingredientUpdateQuery,
									parsed.data.amount,
									parsedQuery.data.id
								);
							flag = true;
						}
					});
					if (!flag) {
						res.status(404).send(
							"ingrediet isn't present in the recipe"
						);
					}
					res.send();
				});
			}
		});
	});
}

export async function addIngredient(req: Request, res: Response) {
	// Connect to the database
	const db = new sqlite.Database("./db.sqlite3", (err: any) => {
		if (err) {
			console.log("opening error: ", err);
			// If databased failed to open the Api is unoperable
			res.status(500).send();
		}
		// Current authorized user
		const user = req.user_id;
		// Recipe id
		const recipe_id = req.params.recipe_id;

		const inputSchema = z.object({
			ingredient_name: z.string(),
			amount: z.number(),
			emission: z.number().optional(),
		});

		const retrivialSchema = z.object({
			id: z.number(),
			name: z.string(),
			amount: z.number(),
		});

		const parsed = inputSchema.safeParse(req.body);

		if (parsed.error) {
			// parse zod errors into user friendly format
			const errors_messages = formatZodErrors(parsed.error.issues);
			res.status(400).json(errors_messages);
			return;
		}

		const recipeRetrivialQuery = `
			SELECT * FROM Recipes
			WHERE id = ? AND user_id = ?
		`;
		const ingredientsRetrivialQuery = `
			SELECT Ing.Id, Ing.name, Ing.amount FROM Ingredients_to_recipes as bridge 
			JOIN Ingredients as Ing ON bridge.ingredient_id = Ing.id
			WHERE bridge.recipe_id  = ?
		`;

		const ingredientInsertionQuery = `
			INSERT INTO Ingredients(name,amount)
			VALUES (?,?);
		`;
		const bridgeInsertionQuery = `
			INSERT INTO Ingredients_to_recipes
			VALUES (?,?,?);
		`;
		db.serialize(() => {
			// Get recipe
			db.get(recipeRetrivialQuery, [recipe_id, user], (err, row) => {
				if (err) {
					// todo: maybe find another way to log errors
					console.log(err);
					res.status(500).send();
				}
				// No recipes found
				if (!row) {
					res.status(404).send(
						"The recipe you wish to add ingredients to either doesn't exists or doesn't belong to the user"
					);
				}
				// Recipe returned 
				// ..... couldn't this be a join query ....
				else {
					db.all(
						ingredientsRetrivialQuery,
						recipe_id,
						(err, rows) => {
							if (err) {
								console.log(err);
								res.status(500).send();
								return;
							}
							console.log("rows", rows);
							// flag to check if update was successful or insertion is needed
							let flag = false;
							rows.forEach((row) => {
								// Parsed results for type safety
								const parsedQuery =
									retrivialSchema.safeParse(row);
								if (!parsedQuery.success) {
									console.log(err);
									res.status(500).send();
									return;
								}
								// If the ingredient is present update it's amount
								if (
									parsedQuery.data?.name ===
									parsed.data.ingredient_name
								) {
									flag = true;
								}
							});
							if (flag) {
								res.status(208).send(
									"ingredient already exists "
								);
								return;
							}
							// Create a bridge table entry for a new ingredient
							db.run(
								ingredientInsertionQuery,
								[
									parsed.data.ingredient_name,
									parsed.data.amount,
								],
								function (err) {
									if (err) {
										console.log(err);
										res.status(500).send();
									}
									db.run(bridgeInsertionQuery, [
										this.lastID,
										recipe_id,
										parsed.data.emission ?? 0	
									]);
									res.status(200).send(
										"new ingredient created"
									);
								}
							);
						}
					);
				}
			});
		});
	});
}
