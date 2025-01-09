import { Request, Response } from "express";
import sqlite3 from "sqlite3";
import dotenv from "dotenv";
import z from "zod";
import db from '../../db';

import {
  formatZodErrors,
} from "../helpers/zodHelpers";

const sqlite = process.env.DEBUG === "TRUE" ? sqlite3.verbose() : sqlite3;

export async function listUserGroups(req: Request, res: Response) {
    const user_id = req.user_id;  // Assumes user_id is available on the req object

    const query = `
        SELECT id, name
        FROM Friend_groups 
    `;

    db.all(query, (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send("An error occurred while fetching user groups.");
            return;
        }

        res.status(200).json({groups: rows});
    });
}

export async function createGroup(req: Request, res: Response) {
  const user_id = parseInt(req.user_id);

  const groupSchema = z.object({
    name: z.string(),
  });

  const parsed = groupSchema.safeParse(req.body);

  if (parsed.error) {
    // Parse zod errors into a user-friendly format
    const error_messages = formatZodErrors(parsed.error.issues);
    res.status(400).json(error_messages);
    return;
  }

  const { name } = parsed.data;

  const insertGroupQuery = `
    INSERT INTO Friend_groups (name)
    VALUES (?)
  `;

  const insertUserGroupQuery = `
    INSERT INTO Friend_groups_to_users (user_id, friend_group_id)
    VALUES (?, ?)
  `;

  db.serialize(() => {
    // Insert the new group
    db.run(insertGroupQuery, [name], function(err) {
      if (err) {
        console.error(err);
        res.status(500).send();
        return;
      }

      const groupId = this.lastID; // Get the id of the inserted group

      // Associate the user with the newly created group
      db.run(insertUserGroupQuery, [user_id, groupId], function(err) {
        if (err) {
          console.error(err);
          res.status(500).send();
          return;
        }

        res.status(200).json({ groupId });
      });
    });
  });
}

export async function updateGroup(req: Request, res: Response) {
	const user_id = parseInt(req.user_id);
  
	const updateGroupSchema = z.object({
	  friend_group_id: z.number().int(),
	  name: z.string(),
	});
  
	const parsed = updateGroupSchema.safeParse(req.body);
  
	if (parsed.error) {
	  // Parse zod errors into a user-friendly format
	  const error_messages = formatZodErrors(parsed.error.issues);
	  res.status(400).json(error_messages);
	  return;
	}
  
	const { friend_group_id, name } = parsed.data;
  
	// SQL query to update the group name
	const updateQuery = `
	  UPDATE Friend_groups
	  SET name = ?
	  WHERE id = ?
	`;
  
	// SQL query to check if the user is part of the group
	const checkUserGroupQuery = `
	  SELECT * FROM Friend_groups_to_users
	  WHERE user_id = ? AND friend_group_id = ?
	`;
  
	db.serialize(() => {
	  // First, check if the user belongs to the group
	  db.get(checkUserGroupQuery, [user_id, friend_group_id], (err, row) => {
		if (err) {
		  console.error(err);
		  res.status(500).send();
		  return;
		}
  
		if (!row) {
		  res.status(403).json({ error: "The group does not exist." });
		  return;
		}
  
		// If the user belongs to the group, update the group name
		db.run(updateQuery, [name, friend_group_id], function(err) {
		  if (err) {
			console.error(err);
			res.status(500).send();
			return;
		  }
  
		  res.status(200).json({ message: "Group updated successfully." });
		});
	  });
	});
  }


  export async function deleteGroup(req: Request, res: Response) {
	const user_id = parseInt(req.user_id);
	const friend_group_id = parseInt(req.params.friend_group_id);
  
	const checkUserGroupQuery = `
	  SELECT * FROM Friend_groups_to_users
	  WHERE user_id = ? AND friend_group_id = ?
	`;
  
	const deleteUserGroupQuery = `
	  DELETE FROM Friend_groups_to_users
	  WHERE friend_group_id = ?
	`;
  
	const deleteGroupQuery = `
	  DELETE FROM Friend_groups
	  WHERE id = ?
	`;
  
	db.serialize(() => {
	  db.get(checkUserGroupQuery, [user_id, friend_group_id], (err, row) => {
		if (err) {
		  console.error(err);
		  res.status(500).send();
		  return;
		}
  
		if (!row) {
		  res.status(403).json({ error: "The group does not exist." });
		  return;
		}
  
		db.run(deleteUserGroupQuery, [friend_group_id], function(err) {
		  if (err) {
			console.error(err);
			res.status(500).send();
			return;
		  }
  
		  db.run(deleteGroupQuery, [friend_group_id], function(err) {
			if (err) {
			  console.error(err);
			  res.status(500).send();
			  return;
			}
  
			res.status(200).json({ message: "Group deleted successfully." });
		  });
		});
	  });
	});
  }

  export async function addUserToGroup(req: Request, res: Response) {
	const user_id = parseInt(req.body.user_id);
	const friend_group_id = parseInt(req.body.friend_group_id);
  
	// SQL query to insert a user into a group
	const insertQuery = `
	  INSERT INTO Friend_groups_to_users (user_id, friend_group_id)
	  VALUES (?, ?)
	`;
  
	db.run(insertQuery, [user_id, friend_group_id], function(err) {
	  if (err) {
		console.error(err);
		if (err.message.includes("UNIQUE constraint failed")) {
		  res.status(400).json({ error: "User already in the group." });
		} else {
		  res.status(500).send();
		}
		return;
	  }
  
	  res.status(200).json({ message: "User added to group successfully." });
	});
  }

  export async function deleteUserFromGroup(req: Request, res: Response) {
	const user_id = parseInt(req.body.user_id);
	const friend_group_id = parseInt(req.body.friend_group_id);
  
	// SQL query to delete a user from a group
	const deleteQuery = `
	  DELETE FROM Friend_groups_to_users
	  WHERE user_id = ? AND friend_group_id = ?
	`;
  
	db.run(deleteQuery, [user_id, friend_group_id], function(err) {
	  if (err) {
		console.error(err);
		res.status(500).send();
		return;
	  }
  
	  if (this.changes === 0) {
		res.status(404).json({ error: "User or group not found." });
		return;
	  }
  
	  res.status(200).json({ message: "User removed from group successfully." });
	});
  }
  