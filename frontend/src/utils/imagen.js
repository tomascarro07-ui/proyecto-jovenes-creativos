const LADO_MAXIMO = 1600
const MAX_BYTES = 3 * 1024 * 1024

function aBlob(canvas, tipo, calidad) {
  return new Promise((ok) => canvas.toBlob(ok, tipo, calidad))
}

function aDataUrl(blob) {
  return new Promise((ok, fallo) => {
    const lector = new FileReader()
    lector.onload = () => ok(lector.result)
    lector.onerror = () => fallo(new Error('No se pudo leer la imagen.'))
    lector.readAsDataURL(blob)
  })
}

export async function reducirImagen(archivo) {
  if (!archivo.type.startsWith('image/')) throw new Error('El archivo tiene que ser una imagen (JPG, PNG, WebP o GIF).')
  let bitmap
  try {
    bitmap = await createImageBitmap(archivo)
  } catch {
    throw new Error('No se pudo abrir la imagen. Probá con un JPG, PNG o WebP.')
  }
  const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * escala))
  canvas.height = Math.max(1, Math.round(bitmap.height * escala))
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  let blob = await aBlob(canvas, 'image/webp', 0.82)
  if (!blob || blob.type !== 'image/webp') blob = await aBlob(canvas, 'image/jpeg', 0.85)
  if (!blob) throw new Error('No se pudo preparar la imagen.')
  if (blob.size > MAX_BYTES) throw new Error('La imagen sigue pesando demasiado. Probá con una más chica.')
  return aDataUrl(blob)
}
