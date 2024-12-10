import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import router from './routes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/',router);

app.set('port',3010);

const server = app.listen(app.get('port'), () => {
	console.log("server has started");
})


