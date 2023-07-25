import { OPENAI_KEY as apiKey, R2_ID, R2_SECRET } from "$env/static/private";
import db from "$lib/db.js";
import { signToken } from "$lib/user-utils";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { error, json } from "@sveltejs/kit";

const r2Endpoint = "https://51f8bc25fa28f29dafad8fac5d55a08a.r2.cloudflarestorage.com";
const endpoint = "https://api.openai.com/v1/images/generations";

const S3 = new S3Client({
  region: "auto",
  endpoint: r2Endpoint,
  credentials: {
    accessKeyId: R2_ID,
    secretAccessKey: R2_SECRET,
  },
});

/**
 *
 * @param {*} param0
 * @returns
 */
export async function GET({ url, cookies, locals }) {
  /** @type {string | null} */
  const queryName = url.searchParams.get("name");
  let name = locals.prospectiveUsername;
  if (!name && queryName) {
    name = queryName;
  }
  console.log("CREATING IMAGE");
  console.log("for:", name);
  if (!name) {
    throw error(404, "MISSING_NAME");
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt: "A cartoon piece of chicken with a psychedelic background painted for " + name,
      size: "256x256",
    }),
  }).then((r) => r.json());
  const imgUrl = res.data[0].url;
  console.log(imgUrl);
  const imgRes = await fetch(imgUrl);
  const imgArrayBuffer = await imgRes.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", imgArrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join(""); // convert bytes to hex string
  console.log("CREATION: ", hashHex);
  await S3.send(
    new PutObjectCommand({
      Bucket: "bao",
      Key: `${name}/image.png`,
      // Body: Buffer.from(imgArrayBuffer),
      Body: new Uint8Array(imgArrayBuffer),
      ContentType: "image/png",
      Metadata: { hash: hashHex },
    })
  );
  const user = await db.createUser({ chicken_name: name, secret: hashHex });

  const token = await signToken(user);
  cookies.set("chicken-auth", token, { path: "/", httpOnly: true, sameSite: "strict" });

  return json({ image: imgUrl, b64: _arrayBufferToBase64(imgArrayBuffer), user });
}

/**
 *
 * @param {*} buffer
 * @returns
 */
function _arrayBufferToBase64(buffer) {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
