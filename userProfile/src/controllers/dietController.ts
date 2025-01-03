import { Request, Response } from "express";
import sqlite3 from "sqlite3";
import db from "../../db";

const sqlite = process.env.DEBUG === "TRUE" ? sqlite3.verbose() : sqlite3;

export const updateAllergy = (req: Request, res: Response) => {
    const { allergy, value } = req.body;
    const userId = req.user_id;

    if (!allergy || value === undefined) {
        res.status(400).json({ error: "Invalid request data" });
        return;
    }

    const query = value
        ? `INSERT INTO UserAllergies (user_id, allergy) VALUES (?, ?) ON CONFLICT DO NOTHING`
        : `DELETE FROM UserAllergies WHERE user_id = ? AND allergy = ?`;

    db.run(query, [userId, allergy], (err) => {
        if (err) {
            console.error("Error updating allergy:", err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
        res.status(200).json({ success: true });
    });
};

export const updatePreference = (req: Request, res: Response) => {
    const { preference, value } = req.body;
    const userId = req.user_id;

    if (!preference || value === undefined) {
        res.status(400).json({ error: "Invalid request data" });
        return;
    }

    const query = value
        ? `INSERT INTO UserPreferences (user_id, preference) VALUES (?, ?) ON CONFLICT DO NOTHING`
        : `DELETE FROM UserPreferences WHERE user_id = ? AND preference = ?`;

    db.run(query, [userId, preference], (err) => {
        if (err) {
            console.error("Error updating preference:", err);
            res.status(500).json({ error: "Internal server error" });
            return;
        }
        res.status(200).json({ success: true });
    });
};
