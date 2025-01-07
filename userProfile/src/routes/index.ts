import express from "express";
import cors from 'cors';
import {
	createRecipe,
	updateRecipe,
	getRecipe,
	getRecipes,
	deleteRecipe,
	updateIngredient,
	addIngredient
} from "../controllers/recipesController";
import { updateDiary , getDiary} from "../controllers/diateryController";
import { authUser } from "../middleware/authUser";
import { getUserCO2, getTotalCO2 } from "../controllers/co2Controller";
import { getLeaderboard } from "../controllers/leaderboardController";

const router = express.Router();

router.get("/", (req, res, next) => {
	res.json("hi");
});

// Diary routes
router.post('/updateDiary',cors(),updateDiary);
router.get('/getDiary/:date',cors(),getDiary);

// Recipes routes
router.get("/getRecipes",cors(), getRecipes);
router.get("/getRecipe/:recipe_id", cors(), getRecipe);
router.post("/createRecipe", cors(), createRecipe);
router.post("/recipes/:recipe_id/updateIngredient",cors(),updateIngredient)
router.post("/recipes/:recipe_id/addIngredient",cors(),addIngredient)
router.patch("/updateRecipe/:recipe_id", cors(), updateRecipe);
router.delete("/deleteRecipe/:recipe_id", cors(), deleteRecipe);

// CO2-related routes
router.get("/co2personal", [cors(), authUser], getUserCO2);
router.get("/co2global", cors(), getTotalCO2);

//Leaderboard routes
router.get("/leaderboard", cors(), getLeaderboard);

export default router;
