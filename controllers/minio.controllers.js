import * as Minio from "minio";

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: Number(process.env.MINIO_PORT),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

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
    const url = await minioClient.presignedPutObject(
      bucket,
      nomeFicheiro,
      86400,
    );
    res.json({ urlDeEnvio: url });
  } catch (erro) {
    next(erro);
  }
};

export const uploadFile = async (req, res, next) => {
  const bucket = req.params.bucket;

  if (!req.file) {
    return res.status(400).json({ erro: "Falta o ficheiro" });
  }

  if (bucket !== "avatar" && bucket !== "files") {
    return res.status(400).json({ erro: "Bucket não autorizado" });
  }

  const nomeFicheiro = req.query.nome || req.file.originalname;

  try {
    await minioClient.putObject(bucket, nomeFicheiro, req.file.buffer, {
      "Content-Type": req.file.mimetype,
    });

    const publicBaseUrl =
      process.env.MINIO_PUBLIC_URL || `http://localhost:9000`;
    const publicUrl = `${publicBaseUrl.replace(/\/+$/, "")}/${bucket}/${nomeFicheiro}`;

    res.json({
      success: true,
      url: publicUrl,
      fileName: nomeFicheiro,
      bucket: bucket,
    });
  } catch (erro) {
    next(erro);
  }
};
