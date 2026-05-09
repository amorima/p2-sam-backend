import * as Minio from "minio";

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: Number(process.env.MINIO_PORT),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
})

export const getPresignedUploadUrl = async (req, res, next) => {
  const bucket = req.params.bucket;
  const nomeFicheiro = req.query.nome;

  if (!nomeFicheiro) {
    return res.status(400).json({ erro: "Falta o nome do ficheiro" });
  }

  if (bucket !== "avatar" && bucket !== "files") {
    return res.status(400).json({ erro: "Bucket não autorizado" });
  }

  try {
    const url = await minioClient.presignedPutObject(bucket, nomeFicheiro, 86400);
    res.json({ urlDeEnvio: url });
  } catch (erro) {
    next(erro);
  }
};

export const uploadFile = async (req, res, next) => {
  const bucket = req.params.bucket;
  const nomeFicheiro = req.query.nome;

  if (!nomeFicheiro) {
    return res.status(400).json({ erro: "Falta o nome do ficheiro" });
  }

  if (bucket !== "avatar" && bucket !== "files") {
    return res.status(400).json({ erro: "Bucket não autorizado" });
  }


  try {
    // Upload the raw body to MinIO
    const buffer = req.body;
    const contentType =
    req.headers["content-type"] || "application/octet-stream";
    await minioClient.putObject(bucket, nomeFicheiro, buffer, {
      "Content-Type": contentType,
    });
    // Construct public URL using the public MinIO endpoint
    const publicBaseUrl = process.env.MINIO_PUBLIC_URL || `http://localhost:9000`;
    const publicUrl = `${publicBaseUrl.replace(/\/+$/, "")}/${bucket}/${nomeFicheiro}`;

    res.json({ 
      success: true, 
      url: publicUrl,
      fileName: nomeFicheiro,
      bucket: bucket
    });
  } catch (erro) {
    next(erro);
  }
};