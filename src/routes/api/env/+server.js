import { NODE_ENV } from "$env/static/private";
import { json } from "@sveltejs/kit";

export async function GET() {
  return json({ NODE_ENV });
}
