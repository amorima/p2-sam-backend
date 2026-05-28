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
    console.log(`[minio] removed ${bucket}/${fileName}`);
  } catch (err) {
    // Object may already be gone or never existed; not fatal.
    console.warn(`[minio] removeObject failed for ${bucket}/${fileName}:`, err);
  }
};

export const listObjectNames = (bucket, prefix) =>
  new Promise((resolve, reject) => {
    const names = [];
    const stream = minioClient.listObjectsV2(bucket, prefix, true);
    stream.on("data", (obj) => { if (obj?.name) names.push(obj.name); });
    stream.on("error", reject);
    stream.on("end", () => resolve(names));
  });

export const removeAllWithPrefix = async (bucket, prefix, exclude = []) => {
  if (!prefix) return [];
  try {
    const names = await listObjectNames(bucket, prefix);
    const excludeSet = new Set(exclude);
    const targets = names.filter((n) => !excludeSet.has(n));
    if (targets.length === 0) return [];
    await minioClient.removeObjects(bucket, targets);
    console.log(`[minio] removed ${targets.length} object(s) from ${bucket} with prefix '${prefix}': ${targets.join(", ")}`);
    return targets;
  } catch (err) {
    console.warn(`[minio] removeAllWithPrefix failed for ${bucket} prefix='${prefix}':`, err);
    return [];
  }
};
