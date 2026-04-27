import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from 'firebase/storage'
import { firebaseStorage } from '@/services/firebase/app'

const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024
const AVATAR_OUTPUT_SIZE = 512
const AVATAR_OUTPUT_QUALITY = 0.86
const AVATAR_OUTPUT_TYPE = 'image/jpeg'
const SUPPORTED_AVATAR_TYPES = new Set([
  'image/jpeg',
  'image/png',
])

const validateAvatarFile = (file: File) => {
  if (!SUPPORTED_AVATAR_TYPES.has(file.type)) {
    throw new Error('請選擇 JPG 或 PNG 圖片。')
  }

  if (file.size > MAX_AVATAR_FILE_SIZE) {
    throw new Error('頭像圖片不能超過 5 MB。')
  }
}

const loadAvatarImage = async (file: File) => {
  const objectUrl = URL.createObjectURL(file)
  const image = new Image()

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('圖片讀取失敗，請重新選擇一張圖片。'))
      image.src = objectUrl
    })

    return image
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

const createAvatarBlob = async (file: File) => {
  const image = await loadAvatarImage(file)
  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight)
  const sourceX = Math.max(0, (image.naturalWidth - sourceSize) / 2)
  const sourceY = Math.max(0, (image.naturalHeight - sourceSize) / 2)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context || sourceSize <= 0) {
    throw new Error('圖片處理失敗，請重新選擇一張圖片。')
  }

  canvas.width = AVATAR_OUTPUT_SIZE
  canvas.height = AVATAR_OUTPUT_SIZE
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    AVATAR_OUTPUT_SIZE,
    AVATAR_OUTPUT_SIZE,
  )

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, AVATAR_OUTPUT_TYPE, AVATAR_OUTPUT_QUALITY)
  })

  if (!blob) {
    throw new Error('圖片壓縮失敗，請重新選擇一張圖片。')
  }

  return blob
}

const createCompressedAvatarFile = async (file: File) => {
  const blob = await createAvatarBlob(file)
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'avatar'

  return new File([blob], `${baseName}.jpg`, {
    lastModified: Date.now(),
    type: AVATAR_OUTPUT_TYPE,
  })
}

const uploadUserAvatar = async (uid: string, file: File) => {
  validateAvatarFile(file)

  const avatarFile = await createCompressedAvatarFile(file)
  validateAvatarFile(avatarFile)

  const reference = storageRef(
    firebaseStorage,
    `user-avatars/${uid}/${Date.now()}.jpg`,
  )

  await uploadBytes(reference, avatarFile, {
    contentType: avatarFile.type,
    customMetadata: {
      ownerUid: uid,
    },
  })

  return getDownloadURL(reference)
}

export { uploadUserAvatar }
