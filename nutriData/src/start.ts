import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import router from './routes';
import swaggerDocs from './utils/swagger';

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/nutri',router);

app.set('port', process.env.PORT || 3010);

const server = app.listen(app.get('port'), () => {
	console.log("server has started");

	swaggerDocs(app,3010);

})


