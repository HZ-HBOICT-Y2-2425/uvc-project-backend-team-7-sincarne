import { Request, Response, NextFunction} from "express";
import sqlite3 from "sqlite3";
import z from "zod";


// Open sqlite in verbose for better error tracing if the app is in debug mode
const sqlite = process.env.DEBUG === "TRUE" ? sqlite3.verbose() : sqlite3;

export async function authUser(req : Request, res : Response, next : NextFunction){
    console.log(req.oidc.user?.sub)
    const userData = req.oidc.user

	const db = new sqlite.Database("./db.sqlite3", (err) => {
		if (err) {
			console.log("opening error: ", err);
			// If databased failed to open the Api is unoperable
			res.status(500).send();
		}
	});

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
        console.log(userData?.sub)
        db.get(retrieveQuery,[userData?.sub],(err,row)=>{
            // If a user has been retrieved
            console.log(row);
            if(row != null){
                // Add user id to request's parameters 
                const parsed = userSchema.safeParse(row);
                if(parsed.success){
                    req.params.user_id = parsed.data.id.toString()
                }else{
                    res.status(500).send(); 
                }
            }else{
                // Create new user with provided data 
                db.run(insertQuery,[userData?.sub,userData?.nickname,userData?.email,userData?.picture],(err)=>{
                    if(err){
                        console.log(err)
                        res.status(500).send();
                        return
                    }
                }).get(retrieveQuery,[userData?.sub],(row,err)=>{
                    // Add user id to request's parameters 
                    const parsed = userSchema.safeParse(row);
                    if(parsed.success){
                        req.params.user_id = parsed.data.id.toString()
                    }else{
                        res.status(500).send(); 
                    }
                })

                db.close()
                next();

            }


        })
    }
    )

    next();
}
