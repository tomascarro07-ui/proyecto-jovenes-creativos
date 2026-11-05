// Textos de los correos que se le mandan a la persona, en el idioma que eligió en el sitio.
// El español es el texto original; en inglés y portugués (de Brasil) se usan las mismas piezas.
const { escaparHTML } = require("./correo");

const BOTON_VERDE = "display:inline-block;background:#09343a;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none";
const PIE = "color:#666;font-size:13px";

const TEXTOS = {
  es: {
    verificacion: {
      asunto: "Confirmá tu correo - Nodo Cultural",
      hola: (n) => `Hola ${n},`,
      intro: "Gracias por registrarte en Nodo Cultural. Confirmá tu correo para poder inscribirte a las actividades.",
      boton: "Confirmar mi correo",
      texto: (n, enlace, horas) =>
        `Hola ${n},\n\nGracias por registrarte en Nodo Cultural. Confirmá tu correo con este enlace (vale ${horas} horas):\n\n${enlace}\n\n` +
        `Si no creaste esta cuenta, ignorá este mensaje.\n`,
      pie: (horas) => `El enlace vale ${horas} horas. Si no creaste esta cuenta, ignorá este mensaje.`,
    },
    restablecer: {
      asunto: "Restablecer tu contraseña - Nodo Cultural",
      hola: (n) => `Hola ${n},`,
      intro: "Recibimos un pedido para restablecer la contraseña de tu cuenta de Nodo Cultural.",
      boton: "Elegir una nueva contraseña",
      texto: (n, enlace, min) =>
        `Hola ${n},\n\nRecibimos un pedido para restablecer la contraseña de tu cuenta de Nodo Cultural.\n` +
        `Usá este enlace (vale ${min} minutos y se puede usar una sola vez):\n\n${enlace}\n\n` +
        `Si no lo pediste vos, ignorá este correo: tu contraseña no cambia.\n`,
      pie: (min) => `El enlace vale ${min} minutos y se puede usar una sola vez.<br>Si no lo pediste vos, ignorá este correo: tu contraseña no cambia.`,
    },
    bienvenida: {
      asunto: "¡Gracias por suscribirte a Nodo Cultural!",
      titulo: "¡Muchas gracias por suscribirte a Nodo Cultural!",
      cuerpo: "Ya sos parte de nuestro Boletín Cultural. Desde ahora vas a poder ver las novedades y las nuevas charlas, talleres y recorridos que vayamos subiendo sobre el patrimonio y la cultura de Colonia del Sacramento.",
      intereses: "Tus intereses:",
      boton: "Ver las novedades",
      baja: (url) => `Si no fuiste vos, o ya no querés recibir estos correos, podés <a href="${url}">darte de baja acá</a>.`,
      texto: (sitio, url) =>
        `¡Muchas gracias por suscribirte a Nodo Cultural!\n\n` +
        `Desde ahora vas a poder ver las novedades y las nuevas charlas, talleres y recorridos que vayamos subiendo.\n` +
        `Mirá las novedades en: ${sitio}\n\nPara darte de baja: ${url}\n`,
    },
  },
  en: {
    verificacion: {
      asunto: "Confirm your email - Nodo Cultural",
      hola: (n) => `Hi ${n},`,
      intro: "Thanks for signing up for Nodo Cultural. Confirm your email so you can register for activities.",
      boton: "Confirm my email",
      texto: (n, enlace, horas) =>
        `Hi ${n},\n\nThanks for signing up for Nodo Cultural. Confirm your email with this link (valid for ${horas} hours):\n\n${enlace}\n\n` +
        `If you didn't create this account, ignore this message.\n`,
      pie: (horas) => `The link is valid for ${horas} hours. If you didn't create this account, ignore this message.`,
    },
    restablecer: {
      asunto: "Reset your password - Nodo Cultural",
      hola: (n) => `Hi ${n},`,
      intro: "We received a request to reset the password for your Nodo Cultural account.",
      boton: "Choose a new password",
      texto: (n, enlace, min) =>
        `Hi ${n},\n\nWe received a request to reset the password for your Nodo Cultural account.\n` +
        `Use this link (valid for ${min} minutes and can only be used once):\n\n${enlace}\n\n` +
        `If you didn't request it, ignore this email: your password won't change.\n`,
      pie: (min) => `The link is valid for ${min} minutes and can only be used once.<br>If you didn't request it, ignore this email: your password won't change.`,
    },
    bienvenida: {
      asunto: "Thanks for subscribing to Nodo Cultural!",
      titulo: "Thank you so much for subscribing to Nodo Cultural!",
      cuerpo: "You're now part of our Cultural Newsletter. From now on you'll be able to see the news and the new talks, workshops and tours we post about the heritage and culture of Colonia del Sacramento.",
      intereses: "Your interests:",
      boton: "See the news",
      baja: (url) => `If it wasn't you, or you no longer want to receive these emails, you can <a href="${url}">unsubscribe here</a>.`,
      texto: (sitio, url) =>
        `Thank you so much for subscribing to Nodo Cultural!\n\n` +
        `From now on you'll be able to see the news and the new talks, workshops and tours we post.\n` +
        `See the news at: ${sitio}\n\nTo unsubscribe: ${url}\n`,
    },
  },
  pt: {
    verificacion: {
      asunto: "Confirme o seu e-mail - Nodo Cultural",
      hola: (n) => `Olá ${n},`,
      intro: "Obrigado por se cadastrar no Nodo Cultural. Confirme o seu e-mail para poder se inscrever nas atividades.",
      boton: "Confirmar o meu e-mail",
      texto: (n, enlace, horas) =>
        `Olá ${n},\n\nObrigado por se cadastrar no Nodo Cultural. Confirme o seu e-mail com este link (válido por ${horas} horas):\n\n${enlace}\n\n` +
        `Se você não criou esta conta, ignore esta mensagem.\n`,
      pie: (horas) => `O link é válido por ${horas} horas. Se você não criou esta conta, ignore esta mensagem.`,
    },
    restablecer: {
      asunto: "Redefinir a sua senha - Nodo Cultural",
      hola: (n) => `Olá ${n},`,
      intro: "Recebemos um pedido para redefinir a senha da sua conta do Nodo Cultural.",
      boton: "Escolher uma nova senha",
      texto: (n, enlace, min) =>
        `Olá ${n},\n\nRecebemos um pedido para redefinir a senha da sua conta do Nodo Cultural.\n` +
        `Use este link (válido por ${min} minutos e pode ser usado uma única vez):\n\n${enlace}\n\n` +
        `Se você não fez o pedido, ignore este e-mail: a sua senha não será alterada.\n`,
      pie: (min) => `O link é válido por ${min} minutos e pode ser usado uma única vez.<br>Se você não fez o pedido, ignore este e-mail: a sua senha não será alterada.`,
    },
    bienvenida: {
      asunto: "Obrigado por assinar o Nodo Cultural!",
      titulo: "Muito obrigado por assinar o Nodo Cultural!",
      cuerpo: "Você já faz parte do nosso Boletim Cultural. A partir de agora poderá ver as novidades e as novas palestras, oficinas e roteiros que formos publicando sobre o patrimônio e a cultura de Colônia do Sacramento.",
      intereses: "Seus interesses:",
      boton: "Ver as novidades",
      baja: (url) => `Se não foi você, ou se não quer mais receber estes e-mails, você pode <a href="${url}">cancelar a assinatura aqui</a>.`,
      texto: (sitio, url) =>
        `Muito obrigado por assinar o Nodo Cultural!\n\n` +
        `A partir de agora poderá ver as novidades e as novas palestras, oficinas e roteiros que formos publicando.\n` +
        `Veja as novidades em: ${sitio}\n\nPara cancelar a assinatura: ${url}\n`,
    },
  },
};

// Las categorías del boletín se guardan en español; en el correo se muestran en el idioma de la persona
const CATEGORIAS = {
  en: {
    "Museos": "Museums", "Historia": "History", "Patrimonio Industrial": "Industrial Heritage", "Educación": "Education",
    "Arte y Exposiciones": "Art and Exhibitions", "Medio Ambiente": "Environment", "Arqueología": "Archaeology",
    "Eventos por Departamento": "Events by Department", "Actividades Familiares": "Family Activities",
  },
  pt: {
    "Museos": "Museus", "Historia": "História", "Patrimonio Industrial": "Patrimônio Industrial", "Educación": "Educação",
    "Arte y Exposiciones": "Arte e Exposições", "Medio Ambiente": "Meio Ambiente", "Arqueología": "Arqueologia",
    "Eventos por Departamento": "Eventos por Departamento", "Actividades Familiares": "Atividades Familiares",
  },
};

const textosDe = (idioma) => TEXTOS[idioma] || TEXTOS.es;

function correoVerificacion({ nombre, enlace, horas, idioma }) {
  const x = textosDe(idioma).verificacion;
  const html =
    `<p>${x.hola(escaparHTML(nombre))}</p>` +
    `<p>${x.intro}</p>` +
    `<p><a href="${enlace}" style="${BOTON_VERDE}">${x.boton}</a></p>` +
    `<p style="${PIE}">${x.pie(horas)}</p>`;
  return { asunto: x.asunto, texto: x.texto(nombre, enlace, horas), html };
}

function correoRestablecer({ nombre, enlace, minutos, idioma }) {
  const x = textosDe(idioma).restablecer;
  const html =
    `<p>${x.hola(escaparHTML(nombre))}</p>` +
    `<p>${x.intro}</p>` +
    `<p><a href="${enlace}" style="${BOTON_VERDE}">${x.boton}</a></p>` +
    `<p style="${PIE}">${x.pie(minutos)}</p>`;
  return { asunto: x.asunto, texto: x.texto(nombre, enlace, minutos), html };
}

function correoBienvenida({ categorias, sitio, urlBaja, idioma }) {
  const x = textosDe(idioma).bienvenida;
  const nombres = (categorias || []).map((c) => (CATEGORIAS[idioma] && CATEGORIAS[idioma][c]) || c);
  const intereses = nombres.length
    ? `<p>${x.intereses} <b>${nombres.map(escaparHTML).join(", ")}</b>.</p>`
    : "";

  const html =
    `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#333">` +
    `<h2>${x.titulo}</h2>` +
    `<p>${x.cuerpo}</p>` +
    intereses +
    `<p><a href="${sitio}" style="background:#a2492a;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">${x.boton}</a></p>` +
    `<hr><p style="color:#777;font-size:12px">${x.baja(urlBaja)}</p>` +
    `</div>`;

  return { asunto: x.asunto, texto: x.texto(sitio, urlBaja), html };
}

module.exports = { correoVerificacion, correoRestablecer, correoBienvenida };
