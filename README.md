# Development
## Tasks
### Set up
For better developer experience belowe is the list of tasks that can be coppied and then pasted into a workspaces tasks in vscode accessible by pressing `ctrl+shirt+p` and selecting `Tasks: Open Workspace Tasks`.
```json
	"tasks": {
		"version": "2.0.0",
		"tasks": [
			{
				"label": "apigateway",
				"type": "shell",
				"command": "npm run dev",
				"options": {
					"cwd": "./apigateway"
				}
			},
			{
				"label": "CO2counter",
				"type": "shell",
				"command": "npm run dev",
				"options": {
					"cwd": "./CO2counter"
				}
			},
			{
				"label": "greenSwap",
				"type": "shell",
				"command": "npm run dev",
				"options": {
					"cwd": "./greenSwap"
				}
			},
			{
				"label": "nutriData",
				"type": "shell",
				"command": "npm run dev",
				"options": {
					"cwd": "./nutriData"
				}
			},
			{
				"label": "userProfile",
				"type": "shell",
				"command": "npm run dev",
				"options": {
					"cwd": "./userProfile"
				}
			},
			{
				"label": "dev all",
				"dependsOn": ["apigateway", "CO2counter", "greenSwap", "nutriData","userProfile"]

			}
			
		]
	}
```

### Running 
To start all the api in dev: press `ctrl+shirt+P` and type `Tasks: Run Tasks` and then select `dev all`