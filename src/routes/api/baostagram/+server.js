import S3 from "$lib/s3";
import { GetObjectCommand, ListObjectsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { json } from "@sveltejs/kit";

/** @type {import('./$types').RequestHandler} */
export async function GET() {
  // list the objects in the s3 bucket: bao
  const res = await S3.send(new ListObjectsCommand({ Bucket: "bao", Prefix: "baostagram" }));
  const urls = []
  if (res.Contents) {
    for (const {Key, LastModified} of res.Contents) {
        // const command = new GetObjectCommand({ Bucket: "bao", Key });
        // @ts-ignore
        // const signedUrl = await getSignedUrl(S3, command);
        urls.push({url:"", lastModified: LastModified, key: Key})
    }
  }
  const headers= {'Cache-Control': 'max-age=300'}
  //cache this response for   5 minutes
    return json(urls);
}
