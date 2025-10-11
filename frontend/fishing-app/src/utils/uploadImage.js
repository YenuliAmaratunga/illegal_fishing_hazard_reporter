// src/utils/uploadImage.js
export async function uploadToCloudinary(localUri) {
  const CLOUD_NAME = "douchcxb1";         
  const UPLOAD_PRESET = "unsigned_aquawatch";    

  const data = new FormData();
  data.append("file", { uri: localUri, type: "image/jpeg", name: "photo.jpg" });
  data.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: data,
  });
  const json = await res.json();
  if (!json?.secure_url) {
    console.log("Cloudinary upload error:", json);
    throw new Error("Upload failed");
  }
  return json.secure_url; 
}
