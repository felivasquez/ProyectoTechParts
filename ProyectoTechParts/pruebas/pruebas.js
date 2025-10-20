// busqueda.js
function iniciarBusqueda(config) {
  const form = document.querySelector(config.form);
  const input = document.querySelector(config.input);
  const select = document.querySelector(config.select);
  const items = document.querySelectorAll(config.items);

  form.addEventListener("submit", (e) => {
    e.preventDefault(); 
    const texto = input.value.trim();
    const opcion = select.value;

    // recargar la página con los parámetros en la URL
    const params = new URLSearchParams();
    if (texto) params.set("q", texto);
    if (opcion) params.set("filtro", opcion);
    window.location.search = params.toString();
  });

  const urlParams = new URLSearchParams(window.location.search);
  const texto = (urlParams.get("q") || "").toLowerCase();
  const opcion = (urlParams.get("filtro") || "").toLowerCase();

  input.value = texto;
  select.value = opcion;

  if (texto || opcion) {
    items.forEach(item => {
      const textoItem = item.textContent.toLowerCase();
      const categoria = item.dataset.categoria?.toLowerCase() || "";

      const coincideTexto = textoItem.includes(texto);
      const coincideOpcion = opcion === "" || categoria === opcion;

      item.style.display = (coincideTexto && coincideOpcion) ? "" : "none";
    });
  }
}