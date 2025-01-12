import {Express, Request, Response} from 'express'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'



const options: swaggerJsdoc.Options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'SinCarne Docs',
			version: '0.3'
		},
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
					description: 'Auth0 token'
				}
			}
		},
		security: [
			{
				bearerAuth: [],
			}
		]
	},
	apis: ['./src/routes/index.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app: Express, port: number) {
	// Swagger page with the try it out functionality disabled
	app.use(
		'/docs',
		swaggerUi.serve,
		swaggerUi.setup(swaggerSpec, {
			swaggerOptions: {
				// Disable the "Try it out" button for all routes
				"tryItOutEnabled": false,
			}
		})
	);

	// Docs in JSON format
	app.get('/docs.json', (req: Request, res: Response) => {
		res.setHeader('Content-Type', 'application/json');
		res.send(swaggerSpec);
	});
}

export default swaggerDocs;
