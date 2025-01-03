import { Request, Response } from "express";
import sqlite3 from "sqlite3";

const sqlite = process.env.DEBUG === "TRUE" ? sqlite3.verbose() : sqlite3;

export async function getLeaderboard(req: Request, res: Response) {
    const db = new sqlite.Database("./dev.db", (err: any) => {
        if (err) {
            console.error("Database connection error:", err);
            res.status(500).json({ error: "Failed to connect to the database." });
        }
    });

    const query = `
        SELECT nickname AS name, CO2Prevented AS co2Saved, picture AS avatar 
        FROM Users
        ORDER BY CO2Prevented DESC
        LIMIT 100;
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("Query error:", err);
            res.status(500).json({ error: "Failed to fetch leaderboard data." });
            return;
        }

        const leaderboard = rows.map((row, index) => ({
            ...row,
            rank: index + 1,
        }));

        res.status(200).json(leaderboard);
    });

    db.close((err) => {
        if (err) {
            console.error("Database close error:", err);
        }
    });
}
