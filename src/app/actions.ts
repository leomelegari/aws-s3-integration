"use server";

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_BUCKET_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_BUCKET_SECRET_ACCESS_KEY!,
  },
});

export async function getSignedURL() {
  // TODO: implement authentication with Authjs
  let fakeSession = false;
  if (fakeSession) {
    return { failure: { message: "Not authenticated" } };
  }

  const putObjCommand = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: "random_key",
  });

  const signedUrl = await getSignedUrl(s3, putObjCommand, {
    expiresIn: 60,
  });

  return { success: { url: signedUrl } };
}
