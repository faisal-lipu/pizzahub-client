/**
 * ImgBB Image Upload Helper
 * Handles uploading local image files to ImgBB via public REST API.
 */
export async function uploadToImgBB(file: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "ImgBB API key is not configured. Please set NEXT_PUBLIC_IMGBB_API_KEY in your environment variables."
    );
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json().catch(() => null);

  if (response.ok && data?.success && data?.data?.url) {
    return data.data.url;
  }

  throw new Error(data?.error?.message || "Failed to upload image to ImgBB.");
}
