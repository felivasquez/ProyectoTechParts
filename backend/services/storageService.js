// backend/services/storageService.js
import supabase from '../config/client.js'

export const uploadFile = async (bucket, path, fileBuffer, contentType) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, fileBuffer, {
      contentType,
      upsert: true
    });
  if (error) throw error;
  return data;
};

const form = document.getElementById("upload-form");
const status = document.getElementById("status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById("product-image");
  const productName = document.getElementById("product-name").value.trim();

  if (!fileInput.files.length) {
    status.textContent = "Seleccioná una imagen.";
    return;
  }

  const file = fileInput.files[0];
  const filePath = `products/${Date.now()}-${file.name}`;

  // 📤 Subir imagen al bucket "store-assets"
  const { data, error } = await supabase.storage
    .from("imagenes")
    .upload(filePath, file);

  if (error) {
    status.textContent = "Error al subir: " + error.message;
    return;
  }

  // 🔗 Obtener URL pública
  const { data: urlData } = supabase.storage
    .from("imagenes")
    .getPublicUrl(filePath);

  const imageUrl = urlData.publicUrl;

  // 💾 Guardar en la tabla "products"
  const { error: dbError } = await supabase
    .from("products")
    .insert([
      { name: productName, image_url: imageUrl }
    ]);

  if (dbError) {
    status.textContent = "Error al guardar en DB: " + dbError.message;
  } else {
    status.textContent = "Producto agregado con éxito 🎉";
    form.reset();
  }
});