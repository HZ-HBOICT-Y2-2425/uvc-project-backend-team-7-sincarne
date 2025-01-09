import { Request, Response } from "express";
import sqlite3 from "sqlite3";

interface UserCO2Data {
    CO2Prevented: number;
}

interface TotalCO2Data {
    totalCO2: number | null;
}

export const getUserCO2 = (req: Request, res: Response) => {
    const userId = req.user_id;

    const db = new sqlite3.Database("./db.sqlite3", (err) => {
        if (err) {
            console.error("Database connection error:", err);
            res.status(500).json({ error: "Failed to connect to the database." });
            return;
        }
    });

    const query = `
        SELECT CO2Prevented
        FROM Users
        WHERE id = ?
    `;

    db.get(query, [userId], (err, row: UserCO2Data | undefined) => {
        if (err) {
            console.error("Error retrieving user CO2 data:", err);
            res.status(500).json({ error: "Internal server error" });
        } else if (!row) {
            res.status(404).json({ error: "User not found" });
        } else {
            res.status(200).json({ co2Saved: row.CO2Prevented });
        }
    });

    db.close((err) => {
        if (err) {
            console.error("Database close error:", err);
        }
    });
};

export const getTotalCO2 = (_req: Request, res: Response) => {
    const db = new sqlite3.Database("./db.sqlite3", (err) => {
        if (err) {
            console.error("Database connection error:", err);
            res.status(500).json({ error: "Failed to connect to the database." });
            return;
        }
    });

    const query = `
        SELECT SUM(CO2Prevented) as totalCO2
        FROM Users
    `;

    db.get(query, [], (err, row: TotalCO2Data | undefined) => {
        if (err) {
            console.error("Error retrieving total CO2 data:", err);
            res.status(500).json({ error: "Internal server error" });
        } else {
            res.status(200).json({ totalCO2: row?.totalCO2 || 0 });
        }
    });

    db.close((err) => {
        if (err) {
            console.error("Database close error:", err);
        }
    });
};
