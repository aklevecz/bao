/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const data = request.json();
  console.log(data);
  return new Response();
}
