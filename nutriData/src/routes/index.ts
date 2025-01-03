import express from "express";
import cors from 'cors';
import { searchFoodsOptionsByName, searchVegeFoodsOptionsByName, searchCarnivorousFoodOptionsByName} from "../controllers/nameSearchController";
import { getNutritionsByCode, getNutritionsByName } from "../controllers/getNutrionsController";
import { getMeatlessSuggestionsKcal, getMeatlessSuggestionsProtein } from '../controllers/meatSwitchController'
import { isMeat } from "../controllers/isMeatController";
import {getEmission} from '../controllers/CO2Controller';

const router = express.Router();

//how to retrieve the user from a microservice without the auth0 configuration
router.get('/nutri/search',cors(), (req, res) => {
	console.log(req.headers['x-user-data']);
	res.sendStatus(200);
});
router.get('/search/:ingredient',cors(),searchFoodsOptionsByName)
router.get('/searchVege/:ingredient',cors(),searchVegeFoodsOptionsByName)
router.get('/searchCarni/:ingredient',cors(),searchCarnivorousFoodOptionsByName)
router.get('/getNutritions/ByCode/:ingredient_code',cors(),getNutritionsByCode)
router.get('/getNutritions/ByName/:ingredient_description',cors(),getNutritionsByName)
router.get('/getSuggestions/protein/:ingredient_code',cors(),getMeatlessSuggestionsProtein)
router.get('/getSuggestions/calories/:ingredient_code',cors(),getMeatlessSuggestionsKcal)
router.get('/isMeat/:ingredient_name',cors(),isMeat)
router.get('/getEmission/:ingredient_code',cors(),getEmission)
 
export default router;