import { Request, Response } from "express";
import sqlite3 from "sqlite3";
import dotenv from "dotenv";

const sqlite = process.env.DEBUG === "TRUE" ? sqlite3.verbose() : sqlite3;

export async function getEmission(req: Request, res: Response) {
	// Connect to the database
	const db = new sqlite.Database("./db.sqlite3", (err) => {
		if (err) {
			console.log("opening error: ", err);
			// If databased failed to open the Api is unoperable
			res.status(500).send();
		}
	});

	const code = req.params.ingredient_code;

	const retrivialQuery = `
		SELECT amount FROM CO2emission 
		WHERE ingredient_code = ?
	`


	db.get(retrivialQuery,code,(err,row)=>{
		if(err){
			res.status(500).send()
			return
		}
		if(!row){
			res.status(404).send("Ingredient's code not found")
		}else{
			res.status(200).json(row);
		}
		db.close()
	})
}
