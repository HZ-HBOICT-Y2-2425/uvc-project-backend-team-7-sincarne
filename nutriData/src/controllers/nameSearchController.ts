import {Request,Response } from "express";
import sqlite3 from "sqlite3"
import dotenv from 'dotenv'
dotenv.config({path: ".env"})


// todo: check against sql injection later
export async function searchFoodsOptionsByName(req : Request,res : Response) {
	// Open sqlite in verbose for better error tracing if the app is in debug mode
	const sqlite = (process.env.DEBUG === "TRUE") ? sqlite3.verbose() : sqlite3;
	// Connect to the database 
	const db = new sqlite.Database('./db.sqlite3',(err)=>{
		if(err){
			console.log("opening error: ",err)
			// If databased failed to open the Api is unoperable
			res.status(500).send()
		}
	})


	// Igredient to search 
	const ingredient = req.params.ingredient;
	// Split ingredient base on spaces removes empty strings and adds sql syntax 
	const words = ingredient.split(' ').filter(word => word).map(word => `%${word}%`);
	// Build like clause while escaping special characters (matches all words in any order
	const likeClause = words.map(() => `ingredient_code LIKE ?`).join(" AND ");
	
	// Sql Query to be executed
	// We are ordering by length so the primary ingredients come first
	const searchQuery = 
		`
			SELECT ingredient_code FROM Ingredient_nutrient_value
			WHERE ${likeClause}
			ORDER BY length(ingredient_code)
			LIMIT ?
		`

	db.serialize(()=>{
		db.all(searchQuery,
			[...words, 10],
			(err, rows ) => {
					if(err){
						console.log("error: ", err);
				}
			
			
			console.log(rows)});
	}
	)
	


	db.close();
	res.status(200).send();

	
}
