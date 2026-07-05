import imageCompression from 'browser-image-compression'

const MAX_SIZE_MB = 0.8
const MAX_WIDTH_OR_HEIGHT = 2048

export async function compressImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: MAX_WIDTH_OR_HEIGHT,
    useWebWorker: true,
    initialQuality: 0.85,
  })
}

export async function compressImages(files: File[]): Promise<File[]> {
  return Promise.all(files.map(compressImage))
}
