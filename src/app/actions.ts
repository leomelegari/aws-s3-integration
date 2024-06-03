"use server";

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import crypto from "crypto";

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_BUCKET_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_BUCKET_SECRET_ACCESS_KEY!,
  },
});

const acceptedTypes = [
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/jpeg",
  "video/mp4",
  "video/webm",
];

const maxFileSize = 1024 * 1024 * 10; // 10mb

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

export async function getSignedURL(
  type: string,
  size: number,
  checksum: string,
) {
  // TODO: implement authentication with Authjs
  let fakeSession = false;
  if (fakeSession) {
    return { failure: { message: "Not authenticated" } };
  }

  if (size > maxFileSize) {
    return { failure: "File too large, please submit a file with 10mb max." };
  }

  if (!acceptedTypes.includes(type)) {
    return { failure: "Invalid file type!" };
  }

  const putObjCommand = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: generateFileName(),
    ContentType: type,
    ContentLength: size,
    ChecksumSHA256: checksum,
    // TODO - set metadata to identify which user upload the file
    /*
      Metadata: {
        userId: session.user.id
      }
    */
  });

  const signedUrl = await getSignedUrl(s3, putObjCommand, {
    // set the time to 60 seconds, after that you wont be able to upload the file
    expiresIn: 60,
  });

  return { success: { url: signedUrl } };
}
