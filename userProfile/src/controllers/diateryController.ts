import { Request, Response } from "express";
import sqlite3 from "sqlite3";
import dotenv from "dotenv";
import z from "zod";
import { createIntegerSchema, formatZodErrors } from "../helpers/zodHelpers";

const sqlite = process.env.DEBUG === "TRUE" ? sqlite3.verbose() : sqlite3;

export async function updateDiary(req: Request, res: Response) {
	// Connect to the database
	const db = new sqlite.Database("./db.sqlite3", (err) => {
		if (err) {
			console.log("opening error: ", err);
			// If databased failed to open the Api is unoperable
			res.status(500).send();
		}
	});
	// Schema for the data received from the client
	const updateSchema = z.object({
		user_id: createIntegerSchema(),
		total_calories: createIntegerSchema().nullable().default(null),
		total_protein: createIntegerSchema().nullable().default(null),
		total_carbs: createIntegerSchema().nullable().default(null),
		total_fats: createIntegerSchema().nullable().default(null),
	});

	// Schema for the data retrieved from the database
	const retrieveSchema = z.object({
		total_calories: z.number().nullable(),
		total_protein: z.number().nullable(),
		total_carbs: z.number().nullable(),
		total_fats: z.number().nullable(),
	});
		


	// Type checking received data provide null for empty values
	const parsed = updateSchema.safeParse(req.body);

	if (parsed.error) {
		// parse zod errors into user friendly format
		const errors_messages = formatZodErrors(parsed.error.issues);
		res.status(400).json(errors_messages);
		return;
	}

	const updateQuery = `
		UPDATE Diatery_diary 
		SET total_calories = ?, total_protein = ?, total_carbs = ?, total_fats = ?
		WHERE user_id = ? AND date = ?
	`;

	const insertQuery = `
		INSERT INTO Diatery_diary
		(user_id, total_calories, total_protein, total_carbs, total_fats, date)
		VALUES (?,?,?,?,?,?)

	`;

	const retrieveQuery = `
		SELECT total_calories, total_protein, total_carbs, total_fats
		FROM Diatery_diary
		WHERE user_id = ? AND date = ?
	`;

	// retrieve today's date in the format DD-MM-YYYY
	const date = new Date().toLocaleDateString("en-GB");

	db.serialize(() => {
		db.get(retrieveQuery, [parsed.data.user_id, date], (err, row) => {
			if (err) {
				console.log("retrieval error: ", err);
				res.status(500).send();
			}
			let updatedData;
			if (row) {
				// parse the retrieved data
				const parsedQuery = retrieveSchema.safeParse(row);
				if (parsedQuery.error) {
					// parse zod errors into user friendly format
					const errors_messages = formatZodErrors(
						parsedQuery.error.issues
					);
					res.status(500).json(errors_messages);
					return;
				}
				// add the values from input parsed data to the parsedQuery
				// switch null values to 0 with ?? operator
				updatedData = {
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
				db.run(
					updateQuery,
					[...Object.values(updatedData), parsed.data.user_id, date],
					(err) => {
						if (err) {
							console.log("update error: ", err);
							res.status(500).send();
						}
						res.status(200).send({ message: "Diary updated" });
					}
				);
			} else {
				// create a new entry in the database
				updatedData = {
				total_calories: parsed.data.total_calories ?? 0,
					total_protein: parsed.data.total_protein ?? 0,
					total_carbs: parsed.data.total_carbs ?? 0,
					total_fats: parsed.data.total_fats ?? 0,
				};
				db.run(
					insertQuery,
					[parsed.data.user_id, ...Object.values(updatedData), date],
					(err) => {
						if (err) {
							console.log("insert error: ", err);
							res.status(500).send();
						}
						res.status(200).send({ message: "New entry created" });
					}
				);
			}
		});
	});
}
