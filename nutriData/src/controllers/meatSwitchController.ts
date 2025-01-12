import { Request, Response } from "express";
import sqlite3 from "sqlite3";
import dotenv from "dotenv";
import z from "zod";

dotenv.config({ path: ".env" });

export async function getMeatlessSuggestionsProtein(
	req: Request,
	res: Response
) {
	getMeatlessSuggestions(req, res, "Protein");
}
export async function getMeatlessSuggestionsKcal(req: Request, res: Response) {
	getMeatlessSuggestions(req, res, "Energy");
}

async function getMeatlessSuggestions(
	req: Request,
	res: Response,
	nutrition_name: string
) {
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

	// Get ingreident id from the request
	const ingredient_code = req.params.ingredient_code;

	// SQL query to be exectuted to get the nutrition for current igredient
	const receiveIngredientQuery = `
		SELECT nutrient_value
		FROM Ingredient_nutrient_value AS nut_v
		LEFT JOIN Nutrient AS nut ON nut_v.nutrient_code = nut.nutrient_nbr
		WHERE nut.name = ? and nut_v.ingredient_code = ?;
	`;

	// SQL query to be exectuted to get ingredients with higher nutrition value than current one that aren't meat
	const receiveHigherIngredients = `
		SELECT nut_v.ingredient_code, nut_v.ingredient_description, nutrient_value, meat.is_meat
		FROM Ingredient_nutrient_value AS nut_v
		LEFT JOIN Nutrient AS nut ON nut_v.nutrient_code = nut.nutrient_nbr
		LEFT JOIN Identified_meat_ingredients as meat on nut_v.ingredient_code = meat.ingredient_code
		WHERE nut.name = ? and nutrient_value > ? and meat.is_meat = 'False'
		ORDER BY nutrient_value
		LIMIT ?
	`;

	// SQL query to be exectuted to get ingredients with lower nutrition value than current one that aren't meat
	const receiveLowerIngredients = `
		SELECT nut_v.ingredient_code, nut_v.ingredient_description, nutrient_value
		FROM Ingredient_nutrient_value AS nut_v
		LEFT JOIN Nutrient AS nut ON nut_v.nutrient_code = nut.nutrient_nbr
		LEFT JOIN Identified_meat_ingredients as meat on nut_v.ingredient_code = meat.ingredient_code
		WHERE nut.name = ? and nutrient_value < ? and meat.is_meat = 'False'
		ORDER BY nutrient_value DESC
		LIMIT ?
	`;

	// Zod Schema for ensuring type safety for nutrient value
	const receiveSchema = z.object({
		nutrient_value: z.number(),
	});

	// Zod Schema for ensuring type safety for receiving suggested ingredients
	const suggestedSchema = z.object({
		ingredient_code: z.number(),
		ingredient_description: z.string(),
		nutrient_value: z.number(),
	});

	// Query Results
	let nutrient_value: number;
	let suggestions: {
		ingredient_code: number;
		ingredient_description: string;
		nutrient_value: number;
	}[] = [];

	db.serialize(() => {
		// Receive the calories of current ingredient
		db.get(
			receiveIngredientQuery,
			[nutrition_name, ingredient_code],
			(err, row) => {
				if (err) {
					console.log("error: ", err);
					res.status(500).send();
				}
				const parsed = receiveSchema.safeParse(row);
				if (parsed.success) {
					nutrient_value = parsed.data.nutrient_value;
				} else {
					//todo: error handling
					console.log(parsed.error);
				}

			// Receive suggestions with higher caloric value
			db.all(
				receiveHigherIngredients,
				[
					nutrition_name,
					nutrient_value,
					process.env.SWITCH_SUGGESTIONS_AMOUNT_HIGH,
				],
				(err, rows) => {
					if (err) {
						console.log("error: ", err);
						res.status(500).send();
					}
					rows.forEach((row) => {
						// parsing output from database in type safe fashion
						const parsed = suggestedSchema.safeParse(row);
						if (parsed.success) {
							suggestions.push(parsed.data);
						} else {
							//todo: error handling
							console.log(parsed.error);
						}
					});
				}
			);
			// Receive suggestions with lower caloric value
			db.all(
				receiveLowerIngredients,
				[
					nutrition_name,
					nutrient_value,
					process.env.SWITCH_SUGGESTIONS_AMOUNT_LOW,
				],
				(err, rows) => {
					if (err) {
						console.log("error: ", err);
						res.status(500).send();
					}
					rows.forEach((row) => {
						// parsing output from database in type safe fashion
						const parsed = suggestedSchema.safeParse(row);
						if (parsed.success) {
							suggestions.push(parsed.data);
						} else {
							//todo: error handling
							console.log(parsed.error);
						}
					});
					suggestions = suggestions.sort((a,b) =>  a.nutrient_value - b.nutrient_value)
					res.status(200).json(suggestions);
					db.close();
				}
			);
		});
	});
}
