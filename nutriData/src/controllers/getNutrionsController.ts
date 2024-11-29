import { Request, Response } from "express";
import sqlite3 from "sqlite3";
import dotenv from "dotenv";


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

}

