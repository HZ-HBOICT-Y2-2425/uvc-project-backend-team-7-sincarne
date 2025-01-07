import { Request, Response } from "express";
import sqlite3 from "sqlite3";
import dotenv from "dotenv";
import z from "zod";

// Open sqlite in verbose for better error tracing if the app is in debug mode
const sqlite = process.env.DEBUG === "TRUE" ? sqlite3.verbose() : sqlite3;

// nutri/getNutritions/ByName/:ingredient_description;
export async function getNutritionsByName(req: Request, res: Response) {
	const ingredient_des = req.params.ingredient_description;
	getNutritions(req, res, null, ingredient_des);
}

// nutri/getNutritions/ByCode/:ingredient_code
export async function getNutritionsByCode(req: Request, res: Response) {
	const ingredient_code = req.params.ingredient_code;
	getNutritions(req, res, ingredient_code);
}

// returns nutritions valus for a given ingredient identified by either ingredient code or description
async function getNutritions(
	req: Request,
	res: Response,
	ingredient_code: null | string = null,
	ingredient_description: null | string = null
) {

	// Connect to the database
	const db = new sqlite.Database("./db.sqlite3", (err) => {
		if (err) {
			console.log("opening error: ", err);
			// If databased failed to open the Api is unoperable
			res.status(500).send();
		}
	});

	// technically speaking currently impossible so in future it could be either 500 or 400 error depending on the cause 
	if(ingredient_code === null && ingredient_description === null){
		// for now 500 seems more accurate
		res.status(500).send();
		return;
	}

	// SQL query to be exectuted
	const receiveQuery =
		`
		SELECT nut.name, nutrient_value, nut.unit_name FROM Ingredient_nutrient_value as nut_v
		LEFT JOIN Nutrient as nut on nut_v.nutrient_code = nut.nutrient_nbr 
	` +
		(ingredient_code !== null
			? `
		WHERE ingredient_code = ?
		`
			: `
		WHERE ingredient_description = ?
		`) +
		`
		AND (nut.name = 'Protein' OR nut.name  = 'Energy' OR nut.name = 'Carbohydrate, by difference' OR nut.name = 'Total lipid (fat)')
	`;
	console.log(receiveQuery)

	// Zod Schema for ensuring type safety
	const receiveSchema = z.object({
		name: z.string(),
		nutrient_value: z.number(),
		unit_name: z.string(),
	});

	// Query Results
	const receiveResults: {
		name: string;
		nutrient_value: number;
		unit_name: string;
	}[] = [];

	db.serialize(() => {
		console.log("code",ingredient_code ?? ingredient_description)
		db.all(receiveQuery, [ingredient_code ?? ingredient_description], (err, rows) => {
			if (err) {
				console.log("error: ", err);
				res.status(500).send();
				return;
			}
			console.log(rows)
			if (!rows) {
				res.status(404).send("ingredient_code doesn't exist");
				return;
			}
			rows.forEach((row) => {
				// parsing output from database in type safe fashion
				const parsed = receiveSchema.safeParse(row);
				if (parsed.success) {
					receiveResults.push(parsed.data);
				} else {
					//todo: error handling
					console.log(parsed.error);
				}
			});
			res.status(200).json(receiveResults);
		});
	});
	db.close();
}
