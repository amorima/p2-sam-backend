import nodemailer from "nodemailer";

const EMAIL_HOST = process.env.EMAIL_HOST || "smtp-relay.brevo.com";
const EMAIL_PORT = Number(process.env.EMAIL_PORT || 587);
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_SMTP_KEY = process.env.EMAIL_SMTP_KEY;

// Surface misconfiguration early instead of failing silently inside sendMail.
if (!EMAIL_USER || !EMAIL_SMTP_KEY) {
  console.warn(
    "[email] EMAIL_USER and/or EMAIL_SMTP_KEY are not set — emails will NOT be sent. " +
      "Define them in the backend .env (Brevo SMTP credentials).",
  );
}

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  // Brevo uses STARTTLS on 587 (secure:false) and implicit TLS on 465 (secure:true).
  secure: EMAIL_PORT === 465,
  requireTLS: EMAIL_PORT !== 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_SMTP_KEY,
  },
});

const FROM = process.env.EMAIL_FROM || "noreply@sam.pt";

// Validate the SMTP connection/credentials at startup so failures are obvious.
// Called from server.js; never throws (logs the result instead).
export async function verifyEmailTransport() {
  if (!EMAIL_USER || !EMAIL_SMTP_KEY) {
    console.warn("[email] Skipping SMTP verification — credentials missing.");
    return false;
  }
  try {
    await transporter.verify();
    console.log(
      `[email] SMTP transport ready (${EMAIL_HOST}:${EMAIL_PORT}, from=${FROM}).`,
    );
    return true;
  } catch (e) {
    console.error(
      "[email] SMTP verification FAILED:",
      e?.response || e?.message || e,
    );
    console.error(
      "[email] Common causes: wrong EMAIL_USER/EMAIL_SMTP_KEY, or the sender " +
        `(${FROM}) is not a verified sender/domain in Brevo.`,
    );
    return false;
  }
}

// Shared layout wrapper
function layout(content) {
  return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SAM – Serviço de Apoio Municipal</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:'Segoe UI',Arial,sans-serif;color:#1a202c;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr>
          <td style="background:#18a05e;padding:32px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-.5px;">SAM</span>
                  <span style="font-size:13px;color:rgba(255,255,255,.75);margin-left:10px;">Serviço de Apoio Municipal</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr><td style="padding:36px 40px 24px;">${content}</td></tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f4f6f8;padding:20px 40px;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#718096;text-align:center;">
              Este email foi gerado automaticamente. Não responda a esta mensagem.<br/>
              &copy; ${new Date().getFullYear()} SAM – Serviço de Apoio Municipal
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function registrationTemplate({ nome_entidade, nif_nipc, role }) {
  const roleLabel = role === "institution" ? "Instituição" : "Mecenas";
  const roleIcon = role === "institution" ? "🏛️" : "🤝";

  return layout(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a202c;">Bem-vindo ao SAM ${roleIcon}</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#4a5568;">O registo foi concluído com sucesso. A sua conta está pronta para ser utilizada.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7faf9;border:1px solid #c6e8d9;border-radius:8px;margin-bottom:28px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 12px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:#718096;">Dados da conta</p>
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:13px;color:#718096;padding:3px 16px 3px 0;white-space:nowrap;">Entidade</td>
              <td style="font-size:14px;font-weight:600;color:#1a202c;">${nome_entidade}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#718096;padding:3px 16px 3px 0;">NIF/NIPC</td>
              <td style="font-size:14px;font-family:monospace;color:#1a202c;">${nif_nipc}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#718096;padding:3px 16px 3px 0;">Tipo</td>
              <td style="font-size:14px;color:#1a202c;">${roleLabel}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 24px;font-size:14px;color:#4a5568;line-height:1.6;">
      Pode agora aceder ao portal SAM com o seu NIF/NIPC e a palavra-passe definida no registo.
      Em caso de dúvida, contacte o suporte municipal.
    </p>

    <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:#18a05e;border-radius:8px;">
          <a href="https://sam.netdw.tech/login"
             style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:.2px;">
            Entrar no portal →
          </a>
        </td>
      </tr>
    </table>
  `);
}

function pinTemplate({
  nome_cidadao,
  item_pedido,
  pin_entrega,
  locker_nome,
  data_expiracao,
}) {
  const expiry = data_expiracao
    ? new Date(data_expiracao).toLocaleString("pt-PT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "7 dias após este email";

  return layout(`
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a202c;">Aguardamos a sua doação</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#4a5568;">
      Olá <strong>${nome_cidadao}</strong>, a sua intenção de doação foi registada com sucesso no SAM.
    </p>

    <!-- Item -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7faf9;border:1px solid #c6e8d9;border-radius:8px;margin-bottom:20px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:#718096;">Artigo reservado</p>
          <p style="margin:0;font-size:17px;font-weight:600;color:#1a202c;">${item_pedido}</p>
          ${locker_nome ? `<p style="margin:6px 0 0;font-size:13px;color:#4a5568;">📍 ${locker_nome}</p>` : ""}
        </td>
      </tr>
    </table>

    <!-- PIN -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a202c;border-radius:8px;margin-bottom:20px;">
      <tr>
        <td style="padding:24px;text-align:center;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:rgba(255,255,255,.55);">Código PIN de levantamento</p>
          <p style="margin:0;font-size:42px;font-weight:700;letter-spacing:10px;color:#ffffff;font-family:monospace;">${pin_entrega}</p>
        </td>
      </tr>
    </table>

    <!-- Warning -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #f6e05e;border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:14px 20px;">
          <p style="margin:0;font-size:13px;color:#744210;line-height:1.5;">
            ⚠️ <strong>Este código é pessoal e intransmissível.</strong>
            Apresente-o no locker para confirmar o levantamento.
            A reserva expira em <strong>${expiry}</strong>, após esse prazo o artigo regressa ao painel.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:#718096;line-height:1.6;">
      Se não efetuou esta reserva, ignore este email. O código expirará automaticamente.
    </p>
  `);
}

// Send registration welcome email (institution or patron)
export async function sendRegistrationEmail({
  email,
  nome_entidade,
  nif_nipc,
  role,
}) {
  if (!email) return;
  const roleLabel = role === "institution" ? "Instituição" : "Mecenas";
  try {
    await transporter.sendMail({
      from: `"SAM – Serviço de Apoio Municipal" <${FROM}>`,
      to: email,
      subject: `Bem-vindo ao SAM – Registo de ${roleLabel} concluído`,
      html: registrationTemplate({ nome_entidade, nif_nipc, role }),
    });
    console.log(`[email] registration email sent to ${email}`);
  } catch (e) {
    console.error(
      "[email] registration send failed:",
      e?.response || e?.message || e,
    );
  }
}

// Send PIN delivery email to citizen after creating a lead
export async function sendPinEmail({
  contacto_cidadao,
  nome_cidadao,
  item_pedido,
  pin_entrega,
  locker_nome,
  data_expiracao,
}) {
  // Only attempt if contacto looks like an email address
  if (!contacto_cidadao || !contacto_cidadao.includes("@")) return;
  try {
    await transporter.sendMail({
      from: `"SAM – Serviço de Apoio Municipal" <${FROM}>`,
      to: contacto_cidadao,
      subject: `SAM – PIN de levantamento: ${item_pedido}`,
      html: pinTemplate({
        nome_cidadao,
        item_pedido,
        pin_entrega,
        locker_nome,
        data_expiracao,
      }),
    });
    console.log(`[email] pin email sent to ${contacto_cidadao}`);
  } catch (e) {
    console.error("[email] pin send failed:", e?.response || e?.message || e);
  }
}
