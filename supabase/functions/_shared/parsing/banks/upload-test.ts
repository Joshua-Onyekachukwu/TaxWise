import { handler } from './upload-statement/index.ts';

const file = await Deno.readFile('./Customer Statement_2.pdf');
const formData = new FormData();
formData.append('file', new Blob([file]), 'Customer Statement_2.pdf');
formData.append('accountId', '123');

const req = new Request('http://localhost/upload', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': 'Bearer <YOUR_SUPABASE_JWT>',
  },
});

handler(req);
