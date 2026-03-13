import { pdf } from 'https://deno.land/x/pdf_parser/mod.ts';

const data = await Deno.readFile('./Customer Statement_2.pdf');
const parsed = await pdf(data);
console.log(parsed.text);
