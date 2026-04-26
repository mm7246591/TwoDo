import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from 'firebase/storage'
import { firebaseStorage } from '@/services/firebase/app'

const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024
const SUPPORTED_AVATAR_TYPES = new Set([
  'image/jpeg',
  'image/png',
])

const getAvatarFileExtension = (file: File) => {
  const extension = file.name.split('.').pop()?.toLowerCase()

  if (extension && /^[a-z0-9]+$/.test(extension)) {
    return extension
  }

  return file.type.split('/')[1] || 'jpg'
}

const validateAvatarFile = (file: File) => {
  if (!SUPPORTED_AVATAR_TYPES.has(file.type)) {
    throw new Error('請選擇 JPG 或 PNG 圖片。')
  }

  if (file.size > MAX_AVATAR_FILE_SIZE) {
    throw new Error('頭像圖片不能超過 5 MB。')
  }
}

const uploadUserAvatar = async (uid: string, file: File) => {
  validateAvatarFile(file)

  const extension = getAvatarFileExtension(file)
  const reference = storageRef(
    firebaseStorage,
    `user-avatars/${uid}/${Date.now()}.${extension}`,
  )

  await uploadBytes(reference, file, {
    contentType: file.type,
    customMetadata: {
      ownerUid: uid,
    },
  })

  return getDownloadURL(reference)
}

export { uploadUserAvatar }
