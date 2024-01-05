import { R2_ID, R2_SECRET } from "$env/static/private";
import { S3Client } from "@aws-sdk/client-s3";

const r2Endpoint = "https://51f8bc25fa28f29dafad8fac5d55a08a.r2.cloudflarestorage.com";

const S3 = new S3Client({
  region: "auto",
  endpoint: r2Endpoint,
  credentials: {
    accessKeyId: R2_ID,
    secretAccessKey: R2_SECRET,
  },
});

export default S3;