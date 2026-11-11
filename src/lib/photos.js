export async function preparePhoto(file) {
  if (!file || file.size > 4 * 1024 * 1024) throw new Error('Choose a JPEG, PNG, or WebP photo under 4 MB.');
  const bytes = new Uint8Array(await file.arrayBuffer());
  let ext;
  if (bytes[0]===255 && bytes[1]===216 && bytes[2]===255) ext='jpg';
  else if ([137,80,78,71,13,10,26,10].every((value,index)=>bytes[index]===value)) ext='png';
  else if (String.fromCharCode(...bytes.slice(0,4))==='RIFF' && String.fromCharCode(...bytes.slice(8,12))==='WEBP') ext='webp';
  else throw new Error('This file is not a supported photo. Choose JPEG, PNG, or WebP.');
  try { const bitmap = await createImageBitmap(file); bitmap.close(); }
  catch { throw new Error('This photo could not be opened. Choose a valid JPEG, PNG, or WebP file.'); }
  let binary=''; for (const byte of bytes) binary+=String.fromCharCode(byte);
  const id=crypto.randomUUID();const mime={jpg:'image/jpeg',png:'image/png',webp:'image/webp'}[ext];
  const content=btoa(binary);
  return {id,path:`public/uploads/${id}.${ext}`,image:`/uploads/${id}.${ext}`,content,mime,size:bytes.length,title:file.name.replace(/\.[^.]+$/,'') || 'Uploaded photo',preview:`data:${mime};base64,${content}`};
}
