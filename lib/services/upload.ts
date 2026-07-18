import { createHash } from "node:crypto";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
const API_KEY = process.env.CLOUDINARY_API_KEY!;
const API_SECRET = process.env.CLOUDINARY_API_SECRET!;

export const uploadToCloudinary = async (base64Image: string): Promise<string> => {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = createHash("sha1")
    .update(`timestamp=${timestamp}${API_SECRET}`)
    .digest("hex");

  const formData = new FormData();
  formData.append("file", base64Image);
  formData.append("api_key", API_KEY);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData },
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message ?? "Cloudinary upload failed");
  }

  const data = await res.json();
  return data.secure_url as string;
};
