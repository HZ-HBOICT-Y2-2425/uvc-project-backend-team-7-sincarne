import { Request, Response } from "express";
import sqlite3 from "sqlite3";
import dotenv from "dotenv";
import z, { string } from "zod";
import { createIntegerSchema, formatZodErrors } from "../helpers/zodHelpers";

const sqlite = process.env.DEBUG === "TRUE" ? sqlite3.verbose() : sqlite3;

export async function updateDiary(req: Request, res: Response) {
	// Connect to the database
	const db = new sqlite.Database("./db.sqlite3", (err: any) => {
		if (err) {
			console.log("opening error: ", err);
			// If databased failed to open the Api is unoperable
			res.status(500).send();
		}
	});

	const user_id = req.user_id;

	// Schema for the data received from the client
	const updateSchema = z.object({
		date: z.string().default(new Date().toDateString()),
		total_calories: z.number(),
		total_protein: z.number(),
		total_carbs: z.number(),
		total_fats: z.number(),
		emission: z.number(),
	});

	// Schema for the data retrieved from the database
	const retrieveSchema = z.object({
		total_calories: z.number().nullable(),
		total_protein: z.number().nullable(),
		total_carbs: z.number().nullable(),
		total_fats: z.number().nullable(),
		emission: z.number().nullable(),
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
		SET total_calories = ?, total_protein = ?, total_carbs = ?, total_fats = ?, emission = ?
		WHERE user_id = ? AND date = ?
	`;

	const insertQuery = `
		INSERT INTO Diatery_diary
		(user_id, total_calories, total_protein, total_carbs, total_fats, emission, date)
		VALUES (?,?,?,?,?,?,?)

	`;

	const retrieveQuery = `
		SELECT total_calories, total_protein, total_carbs, total_fats, emission
		FROM Diatery_diary
		WHERE user_id = ? AND date = ?
	`;

	db.serialize(() => {
		db.get(retrieveQuery, [user_id, parsed.data.date], (err, row) => {
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
					emissions:
						(parsed.data.emission ?? 0) +
						(parsedQuery.data.emission ?? 0),
				};
				db.run(
					updateQuery,
					[...Object.values(updatedData), user_id, parsed.data.date],
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
					emission: parsed.data.emission ?? 0,
				};
				db.run(
					insertQuery,
					[user_id, ...Object.values(updatedData), parsed.data.date],
					(err) => {
						if (err) {
							console.log("insert error: ", err);
							res.status(500).send();
						}
						res.status(201).send({ message: "New entry created" });
					}
				);
			}
			// Update global co2 prevented for the user
			db.get(
				`
				SELECT CO2Prevented from Users
				WHERE id = ?
				`,
				[user_id],
				(err, row) => {
					if (err) {
						console.log("error: ", err);
						res.status(500).send();
					}
					const schema = z.object({
						CO2Prevented: z.number().nullable(),
					});
					let userCO2 = schema.safeParse(row).data?.CO2Prevented ?? 0;
					userCO2 += updatedData.emissions ?? 0;
					db.run(
						`
						UPDATE Users
						SET CO2Prevented = ?
						WHERE id = ?
						`,
						[userCO2, user_id]
					);
				}
			);
		});
	});
}

export async function getDiary(req: Request, res: Response) {
	// Connect to the database
	const db = new sqlite.Database("./db.sqlite3", (err: any) => {
		if (err) {
			console.log("opening error: ", err);
			// If databased failed to open the Api is unoperable
			res.status(500).send();
		}
	});

	const user_id = req.user_id;

	const date = req.params.date;

	const retrieveQuery = `
		SELECT total_calories, total_protein, total_carbs, total_fats, emission
		FROM Diatery_diary
		WHERE user_id = ? AND date = ?
	`;

	db.get(retrieveQuery, [user_id, date], (err, row) => {
		if (err) {
			console.log("retrieval error: ", err);
			res.status(500).send();
		}
		// return data with the row is there
		if (row) {
			res.status(200).json(row);
			// not having a object for a date shouldn't create an error either instead just return empty skeleton
		} else {
			res.status(200).json({
				total_calories: 0,
				total_protein: 0,
				total_carbs: 0,
				total_fats: 0,
				emission: 0,
			});
		}
	});
}
