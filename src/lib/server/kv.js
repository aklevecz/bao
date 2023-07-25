import { KV_REST_API_TOKEN, KV_REST_API_URL } from "$env/static/private";
import { Redis as createClient } from "@upstash/redis/cloudflare";
const kv = new createClient({
  url: KV_REST_API_URL,
  token: KV_REST_API_TOKEN,
});

export default kv;
