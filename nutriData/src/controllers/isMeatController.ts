
import { Request, Response } from "express";
import sqlite3 from "sqlite3";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: ".env" });


// nutri/isMeat/:ingredient_name
export async function isMeat(req: Request, res: Response) {

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

	const ingredient_name = req.params.ingredient_name;

	const retrivialQuery = `
		SELECT meat.ingredient_code, meat.is_meat FROM Identified_meat_ingredients as meat INNER JOIN (SELECT DISTINCT ingredient_code FROM Ingredient_nutrient_value as Inv
		WHERE ingredient_description = ?) as Un ON Un.ingredient_code = meat.ingredient_code;
	`
	

	db.get(retrivialQuery,ingredient_name,(err,row)=>{
		if (err) {
			console.log(err);
			res.status(500).send();
			return;
		}
		if(!row){
			res.status(404).send("Ingredient not found");
		} else {
			
			res.status(200).json(row);
		}
		db.close();
	})


}