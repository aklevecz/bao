import db from "$lib/db";

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const data = await request.json();
  await db.createNotificationSubscription(data);
  return new Response();
}
