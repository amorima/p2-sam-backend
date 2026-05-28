import * as Minio from "minio";

export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: Number(process.env.MINIO_PORT),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

export const buildPublicUrl = (bucket, fileName) => {
  const base = process.env.MINIO_PUBLIC_URL || "http://localhost:9000";
  return `${base.replace(/\/+$/, "")}/${bucket}/${fileName}`;
};

export const removeObjectSafe = async (bucket, fileName) => {
  if (!fileName) return;
  try {
    await minioClient.removeObject(bucket, fileName);
  } catch (err) {
    // Object may already be gone or never existed; not fatal.
    console.warn(`[minio] removeObject failed for ${bucket}/${fileName}: ${err.message}`);
  }
};
