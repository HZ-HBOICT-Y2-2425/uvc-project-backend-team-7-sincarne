import express from "express";
import cors from 'cors';
import { searchFoodsOptionsByName } from "../controllers/nameSearchController";
import { getNutritions } from "../controllers/getNutrionsController";

const router = express.Router();



router.get('/',(req,res,next) => {
	res.json("hi");
})

router.get('/search/:ingredient',cors(),searchFoodsOptionsByName)
router.get('/getNutritions/:ingredient_code',cors(),getNutritions)


export default router;