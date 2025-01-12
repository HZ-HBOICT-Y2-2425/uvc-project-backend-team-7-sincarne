import { Request, Response, NextFunction} from "express";
import sqlite3 from "sqlite3";
import z from "zod";
import db from '../../db'

// Open sqlite in verbose for better error tracing if the app is in debug mode
const sqlite = process.env.DEBUG === "TRUE" ? sqlite3.verbose() : sqlite3;

export async function authUser(req : Request, res : Response, next : NextFunction){
    const userData = req.oidc.user
    console.log('auth called')


    const userSchema = z.object({
        id : z.number()
    })

    const retrieveQuery = `
        Select id FROM Users
        WHERE auth0Indetyfier = ?
    `
    const insertQuery = `
        INSERT INTO Users (auth0Indetyfier,nickname,email,picture,CO2Prevented)
        VALUES (?,?,?,?,0)
    `

    db.serialize(()=>{
        // Check if user exists    
        db.get(retrieveQuery,[userData?.sub],(err,row)=>{
            // If a user has been retrieved
            if(row != null){
                // Add user id to request's parameters 
                const parsed = userSchema.safeParse(row);
                if(parsed.success){
                    req.user_id = parsed.data.id.toString()
                }else{
					console.log(parsed.error)
                    res.status(500).send(); 
					return;
                }
            }else{
                // Create new user with provided data 
                db.run(insertQuery,[userData?.sub,userData?.nickname,userData?.email,userData?.picture],(err)=>{
                    if(err){
                        console.log(err)
                        res.status(500).send();
                    }
                }).get(retrieveQuery,[userData?.sub],(err,row)=>{
                    // Add user id to request's parameters 
                    const parsed = userSchema.safeParse(row);
                    if(parsed.success){
                        req.user_id = parsed.data.id.toString()
                    }else{
						console.log(parsed.error)
                        res.status(500).send(); 
						return;
                    }
                })


            }
            next();

        })
    }
    )

}
