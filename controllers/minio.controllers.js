import { minioClient, buildPublicUrl } from "../utils/minio.utils.js";
import { genericError, notFoundError } from "../utils/error.utils.js";

const ALLOWED_BUCKETS = ["avatar", "files"];

// Strip CR/LF and quotes so a crafted filename cannot inject headers via
// Content-Disposition.
const sanitizeFileName = (name) => String(name).replace(/[\r\n"]/g, "");

export const getPresignedUploadUrl = async (req, res, next) => {
  const bucket = req.params.bucket;
  const nomeFicheiro = req.query.nome;

  if (!nomeFicheiro) {
    return res.status(400).json({ erro: "Falta o nome do ficheiro" });
  }

  if (!ALLOWED_BUCKETS.includes(bucket)) {
    return res.status(400).json({ erro: "Bucket não autorizado" });
  }

  try {
    const url = await minioClient.presignedPutObject(
      bucket,
      String(nomeFicheiro),
      86400,
    );
    res.json({ urlDeEnvio: url });
  } catch (erro) {
    console.error("[minio] presigned url error:", erro?.message);
    next(genericError("Erro ao gerar URL de upload"));
  }
};

export const downloadFile = async (req, res, next) => {
  const bucket = req.params.bucket;
  const nomeFicheiro = req.query.nome;

  if (!nomeFicheiro) {
    return res.status(400).json({ erro: "Falta o nome do ficheiro" });
  }

  if (!ALLOWED_BUCKETS.includes(bucket)) {
    return res.status(400).json({ erro: "Bucket não autorizado" });
  }

  try {
    const stream = await minioClient.getObject(bucket, String(nomeFicheiro));
    const ext = String(nomeFicheiro).split(".").pop()?.toLowerCase() ?? "";
    const mimeTypes = {
      jpg: "image/jpeg", jpeg: "image/jpeg",
      png: "image/png", gif: "image/gif", webp: "image/webp",
      pdf: "application/pdf",
    };
    const contentType = mimeTypes[ext] ?? "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `inline; filename="${sanitizeFileName(nomeFicheiro)}"`);
    stream.on("error", (erro) => {
      console.error("[minio] download stream error:", erro?.message);
      if (!res.headersSent) {
        res.status(500).json({ description: "Erro ao transferir o ficheiro" });
      } else {
        res.destroy();
      }
    });
    stream.pipe(res);
  } catch (erro) {
    if (erro?.code === "NoSuchKey" || erro?.code === "NotFound") {
      return next(notFoundError("File", String(nomeFicheiro)));
    }
    console.error("[minio] download error:", erro?.message);
    next(genericError("Erro ao transferir o ficheiro"));
  }
};

export const uploadFile = async (req, res, next) => {
  const bucket = req.params.bucket;

  if (!req.file) {
    return res.status(400).json({ erro: "Falta o ficheiro" });
  }

  if (!ALLOWED_BUCKETS.includes(bucket)) {
    return res.status(400).json({ erro: "Bucket não autorizado" });
  }

  const nomeFicheiro = String(req.query.nome || req.file.originalname);

  try {
    await minioClient.putObject(bucket, nomeFicheiro, req.file.buffer, {
      "Content-Type": req.file.mimetype,
    });

    res.json({
      success: true,
      url: buildPublicUrl(bucket, nomeFicheiro),
      fileName: nomeFicheiro,
      bucket: bucket,
    });
  } catch (erro) {
    console.error("[minio] upload error:", erro?.message);
    next(genericError("Erro ao carregar o ficheiro"));
  }
};
