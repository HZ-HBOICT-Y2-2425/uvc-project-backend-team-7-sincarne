import { Request, Response } from "express";
import sqlite3 from "sqlite3";
import dotenv from "dotenv";
import z from "zod";

export async function getNutritions(req: Request, res: Response) {
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
	// SQL query to be exectuted
	const receiveQuery = `
		SELECT nut.name, nutrient_value, nut.unit_name FROM Ingredient_nutrient_value as nut_v
		LEFT JOIN Nutrient as nut on nut_v.nutrient_code = nut.nutrient_nbr 
		WHERE ingredient_code = ? 
	`;

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
		db.all(receiveQuery, [ingredient_code], (err, rows) => {
			if (err) {
				console.log("error: ", err);
				res.status(500).send();
			}
			rows.forEach((row) => {
				// parsing output from database in type safe fashion
				const parsed = receiveSchema.safeParse(row);
				if(parsed.success){
					receiveResults.push(parsed.data)
				}else{
					//todo: error handling
					console.log(parsed.error);
				}
			});
			res.status(200).json(receiveResults);
		});
	});
	db.close();
}
