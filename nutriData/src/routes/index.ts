import express from "express";
import cors from 'cors';
import { searchFoodsOptionsByName } from "../controllers/nameSearchController";
import { getNutritions } from "../controllers/getNutrionsController";
import { getMeatlessSuggestionsKcal, getMeatlessSuggestionsProtein } from '../controllers/meatSwitchController'

const router = express.Router();



router.get('/',(req,res,next) => {
	res.json("hi");
})

router.get('/search/:ingredient',cors(),searchFoodsOptionsByName)
router.get('/getNutritions/:ingredient_code',cors(),getNutritions)
router.get('/getSuggestions/protein/:ingredient_code',cors(),getMeatlessSuggestionsProtein)
router.get('/getSuggestions/calories/:ingredient_code',cors(),getMeatlessSuggestionsKcal)


export default router;