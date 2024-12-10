import { z } from "zod";

// Helper function to create a schema 
export function createIntegerSchema () {
	return z.string().transform((val: string, ctx: { addIssue: (arg0: { code: any; message: string; }) => void; }) => {
		const parsed = parseFloat(val); // Convert string to integer
		if (isNaN(parsed)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `field must be an integer`,
			});
			return z.NEVER; // Transformation failed
		}
		return parsed; // Successfully parsed as a number
	})
};

export function formatZodErrors(errors : z.ZodIssue[]) {
	return errors.map((error) => ({
		field: error.path.join('.'), // Convert the path array to a dot-separated string
		message: error.message,     // Include the error message
	}));
}



// Helper function to create a schema 
export function createArraySchema () {
	return z.string().transform((val: string, ctx: { addIssue: (arg0: { code: any; message: string; }) => void; }) => {
		// Desired type
		const parsed : string[] = [];
		// If the current interation was after a " char
		let inString = false;
		// Temporary variable to store each string
		let temp : string = "";
		// Check if the input is surrounded by '[',']'
		if(!(val.startsWith('[') && val.endsWith(']'))){
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `field must a string array`,
			});

			return z.NEVER;
		}
		// Remove the '[', ']' of an array and iterater over each character
		for (let char of val.substring(1,val.length-1)){ 
			// While inString is false only " and , characters are valid
			if(!inString && (char === '"' || char ===',')){
				// In correct array this means seperation between strings
				if(char === ','){
					continue
				}
				// " starts the string
				inString = true;
			// Add all the characters to a temporary string till another " is encountered 
			}else if(inString){
				if(char === '"'){
					parsed.push(temp);
					temp = "";
					inString=false;
				}else{
					temp += char;
				}
			// All other options aren't a valid string array
			}else {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `field must a string array`,
				});

				return z.NEVER; 
			}
		}
		// The interation has to end with all the strings closed
		if(inString){
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `field must a string array`,
			});

			return z.NEVER; 
		}
		// return the list with strings
		return parsed;

	})
};