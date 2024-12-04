import express from "express";
import cors from 'cors';
import { createRecipe, updateRecipe } from "../controllers/recipesController";
import { updateDiary } from "../controllers/diateryController";

const router = express.Router();



router.get('/',(req,res,next) => {
	res.json("hi");
})

router.post('/createRecipe',cors(),createRecipe);
router.patch('/updateRecipe/:recipe_id',cors(),updateRecipe);
router.post('/updateDiary',cors(),updateDiary);

export default router;