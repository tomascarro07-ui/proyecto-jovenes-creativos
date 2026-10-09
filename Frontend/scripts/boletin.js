// Suscripción al boletín: manda el correo y las categorías al backend,
// que guarda al suscriptor y le envía el correo de bienvenida.
const formBoletin = document.getElementById("formBoletin");

if (formBoletin) {
  const mensajeBoletin = document.getElementById("boletinMsg");

  function mostrarMensajeBoletin(texto, esError) {
    mensajeBoletin.textContent = texto;
    mensajeBoletin.style.color = esError ? "#a2492a" : "";
    mensajeBoletin.hidden = false;
  }

  formBoletin.addEventListener("submit", async function (e) {
    e.preventDefault();

    const boton = formBoletin.querySelector('button[type="submit"]');
    const textoOriginal = boton.textContent;
    boton.disabled = true;
    boton.textContent = t("bol.enviando");
    mensajeBoletin.hidden = true;

    const categorias = Array.from(formBoletin.querySelectorAll('input[name="cat"]:checked'))
      .map(function (c) { return c.value; });

    try {
      const datos = await pedirApi("/boletin", {
        method: "POST",
        body: {
          email: document.getElementById("boletinEmail").value,
          categorias: categorias
        }
      });

      mostrarMensajeBoletin((datos && datos.mensaje) || t("bol.gracias"), false);
      formBoletin.reset();
    } catch (error) {
      mostrarMensajeBoletin(error.message || t("bol.error"), true);
    } finally {
      boton.disabled = false;
      boton.textContent = textoOriginal;
    }
  });
}
