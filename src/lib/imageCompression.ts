/**
 * Browser-side Image Compression Utility for AK Sports Admin
 * Enforces:
 * - Max 1200px width / height maintaining aspect ratio
 * - Formats: image/jpeg or image/webp
 * - File size strictly under 300 KB
 */

export interface CompressionResult {
  file: File;
  previewUrl: string;
  originalSizeKB: number;
  compressedSizeKB: number;
  width: number;
  height: number;
}

export async function compressProductImage(
  file: File,
  maxDimension = 1200,
  maxSizeBytes = 300 * 1024 // 300 KB
): Promise<CompressionResult> {
  // Upfront browser validation (Security Rule 4)
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!file.type || !allowedTypes.includes(file.type.toLowerCase())) {
    throw new Error(
      `File "${file.name}" has unpermitted format (${file.type || 'unknown'}). Only JPG, PNG, and WebP images are allowed.`
    );
  }

  if (file.size === 0) {
    throw new Error(`File "${file.name}" is empty (0 bytes).`);
  }

  if (file.size > 25 * 1024 * 1024) {
    throw new Error(
      `File "${file.name}" exceeds maximum upload size of 25 MB before compression.`
    );
  }

  const originalSizeKB = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = async () => {
        let width = img.width;
        let height = img.height;

        // Calculate scaled dimensions (max 1200px on longest edge)
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context not available'));
          return;
        }

        // Draw image onto canvas with high quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try compress to under 300 KB using stepped quality reduction
        let quality = 0.88;
        let blob: Blob | null = null;
        const format = file.type === 'image/webp' ? 'image/webp' : 'image/jpeg';
        const ext = format === 'image/webp' ? '.webp' : '.jpg';

        while (quality >= 0.3) {
          blob = await new Promise<Blob | null>((res) => {
            canvas.toBlob(res, format, quality);
          });

          if (blob && blob.size <= maxSizeBytes) {
            break;
          }
          // Reduce quality to fit under 300 KB
          quality -= 0.12;
        }

        // If still slightly over, final attempt at lower dimension
        if (blob && blob.size > maxSizeBytes && (width > 800 || height > 800)) {
          canvas.width = Math.round(width * 0.8);
          canvas.height = Math.round(height * 0.8);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          blob = await new Promise<Blob | null>((res) => {
            canvas.toBlob(res, format, 0.65);
          });
        }

        if (!blob) {
          reject(new Error('Failed to generate compressed image blob'));
          return;
        }

        // Strict 300 KB ceiling check (Security Rule 4)
        if (blob.size > maxSizeBytes) {
          reject(
            new Error(
              `Image "${file.name}" exceeds the 300 KB limit after compression (${Math.round(blob.size / 1024)} KB). Please crop or use a smaller image.`
            )
          );
          return;
        }

        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, '_');

        const compressedFile = new File([blob], `${cleanName}_opt${ext}`, {
          type: format,
          lastModified: Date.now(),
        });

        const previewUrl = URL.createObjectURL(blob);
        const compressedSizeKB = Math.round(blob.size / 1024);

        resolve({
          file: compressedFile,
          previewUrl,
          originalSizeKB,
          compressedSizeKB,
          width,
          height,
        });
      };

      img.onerror = () => {
        reject(new Error('Invalid image file format or corrupted image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };

    reader.readAsDataURL(file);
  });
}
