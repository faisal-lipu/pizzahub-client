/**
 * ImgBB Image Upload Helper
 * Handles uploading local image files to ImgBB via public REST API.
 */
export async function uploadToImgBB(file: File): Promise<string> {
  const apiKey =
    process.env.NEXT_PUBLIC_IMGBB_API_KEY || "6d207e02198a847aa5fb3d0add1836e2"; // Default working key for Assignment 9

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success && data.data?.url) {
      return data.data.url;
    }

    throw new Error(data.error?.message || "Failed to upload image to ImgBB.");
  } catch (err: unknown) {
    console.error("[ImgBB Upload Error]:", err);
    throw err;
  }
}
