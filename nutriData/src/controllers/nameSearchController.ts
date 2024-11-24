import {Request,Response } from "express";
import sqlite3 from "sqlite3"
import dotenv from 'dotenv'
dotenv.config({path: ".env"})



export async function searchFoodsOptionsByName(req : Request,res : Response) {
	const sqlite = (process.env.DEBUG === "TRUE") ? sqlite3.verbose() : sqlite3;
	//Open sqlite in verbose 
	const db = new sqlite.Database('./db.sqlite3',(err)=>{
		if(err){
			console.log("opening error: ",err)
		}
	})
	db.serialize(()=>{
		db.all(`
			SELECT name FROM sqlite_schema
			WHERE type='table'
			ORDER BY name`,
			(err, rows ) => {
					if(err){
						console.log("error: ", err);
				}
			
			
			console.log(rows)});

	}
	)
	
	console.log(req.params);


	db.close();
	res.status(200).send();

	
}
