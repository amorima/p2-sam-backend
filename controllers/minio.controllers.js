import { minioClient, buildPublicUrl } from "../utils/minio.utils.js";

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

export const downloadFile = async (req, res, next) => {
  const bucket = req.params.bucket;
  const nomeFicheiro = req.query.nome;

  if (!nomeFicheiro) {
    return res.status(400).json({ erro: "Falta o nome do ficheiro" });
  }

  if (bucket !== "avatar" && bucket !== "files") {
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
    res.setHeader("Content-Disposition", `inline; filename="${nomeFicheiro}"`);
    stream.pipe(res);
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

    res.json({
      success: true,
      url: buildPublicUrl(bucket, nomeFicheiro),
      fileName: nomeFicheiro,
      bucket: bucket,
    });
  } catch (erro) {
    next(erro);
  }
};
