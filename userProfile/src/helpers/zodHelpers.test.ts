import {createArraySchema} from './zodHelpers'

test("String cannot be empty",()=>{
	const input = ""
	const parser = createArraySchema();
	expect(parser.safeParse(input).success).toBe(false);
})

test("Empty array is permitted",()=>{
	const input = "[]"
	const parser = createArraySchema();
	expect(parser.safeParse(input).success).toBe(true);
})


test("Single element array with string is parsed succesfully",()=>{
	const input = `["test"]`
	const parser = createArraySchema();
	expect(parser.safeParse(input).success).toBe(true);
})


test(`Single element not surrounded by "`,()=>{
	const input = `[test]`
	const parser = createArraySchema();
	expect(parser.safeParse(input).success).toBe(false);
})

test(`Single element surrounded by " on both sides`,()=>{
	const input = `[test"]`
	const parser = createArraySchema();
	expect(parser.safeParse(input).success).toBe(false);
})


test(`Single element surrounded by on both sides #2"`,()=>{
	const input = `["test]`
	const parser = createArraySchema();
	expect(parser.safeParse(input).success).toBe(false);
})

test(`Single element is correctly surrounded by "`,()=>{
	const input = `[""test]`
	const parser = createArraySchema();
	expect(parser.safeParse(input).success).toBe(false);
})


test(`Multiple string elements parse successufly`,()=>{
	const input = `["blabal","test"]`
	const parser = createArraySchema();
	expect(parser.safeParse(input).success).toBe(true);
})


test(`Multiple string elements with mixed in wrong elements parse unsuccessufly`,()=>{
	const input = `["blabal","12","123", 123]`
	const parser = createArraySchema();
	expect(parser.safeParse(input).success).toBe(false);
})


test(`, in strings are parsed successfully`,()=>{
	const input = `["blabal","new , cute"]`
	const parser = createArraySchema();
	expect(parser.safeParse(input).success).toBe(true);
})