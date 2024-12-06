import { Request, Response } from "express";
import sqlite3 from "sqlite3";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: ".env" });

export async function searchFoodsOptionsByName(req: Request, res: Response) {
	// Open sqlite in verbose for better error tracing if the app is in debug mode
	const sqlite = process.env.DEBUG === "TRUE" ? sqlite3.verbose() : sqlite3;
	// Connect to the database
	const db = new sqlite.Database("./db.sqlite3", (err) => {
		if (err) {
			console.log("opening error: ", err);
			// If databased failed to open the Api is unoperable
			res.status(500).send();
		}
	});

	// Igredient to search
	const ingredient = req.params.ingredient;
	// Split ingredient base on spaces removes empty strings and adds sql syntax
	const words = ingredient
		.split(" ")
		.filter((word) => word)
		.map((word) => `%${word}%`);
	// Build like clause while escaping special characters (matches all words in any order
	const likeClause = words.map(() => `ingredient_description LIKE ?`).join(" AND ");

	// Sql Query to be executed
	// We are ordering by length so the primary ingredients come first
	const searchQuery = `
			SELECT DISTINCT ingredient_code, ingredient_description FROM Ingredient_nutrient_value
			WHERE ${likeClause}
			ORDER BY length(ingredient_description)
			LIMIT ?
		`;

	// Zod Schema for ensuring type safety
	const searchSchema = z.object({
		ingredient_code: z.number(),
		ingredient_description: z.string(),
	});

	// Typed safe results
	const searchResult: { ingredient_code: number; ingredient_description: string }[] = new Array();

	db.serialize(() => {
		db.all(searchQuery, [...words, process.env.SEARCH_AMOUNT], (err, rows) => {
			if (err) {
				console.log("error: ", err);
				res.status(500).send();
			}
			rows.forEach((row) => {
				// Parsing output from database in type safe fashion
				const parsed = searchSchema.safeParse(row);
				if (parsed.success) {
					searchResult.push(parsed.data);
					console.log(searchResult);
				} else {
					//todo: error handling
					console.log(parsed.error);
				}
			});
			// Since those db calls are made after code execution we have to return the output here
			res.status(200).json(searchResult);
		});
	});
	db.close();
}
