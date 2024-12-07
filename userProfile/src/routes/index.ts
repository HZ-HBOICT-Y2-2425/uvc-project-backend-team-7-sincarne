import express from "express";
import cors from 'cors';
import {
	createRecipe,
	updateRecipe,
	getRecipe,
	getRecipes,
} from "../controllers/recipesController";
import { updateDiary } from "../controllers/diateryController";

const router = express.Router();

router.get("/", (req, res, next) => {
	res.json("hi");
});


router.post('/updateDiary',cors(),updateDiary);

router.get("/getRecipes", cors(), getRecipes);
router.get("/getRecipe/:recipe_id", cors(), getRecipe);
router.post("/createRecipe", cors(), createRecipe);
router.patch("/updateRecipe/:recipe_id", cors(), updateRecipe);

export default router;
