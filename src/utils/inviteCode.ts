const INVITE_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const INVITE_CODE_LENGTH = 8

 const generateInviteCode = () => {
  return Array.from({ length: INVITE_CODE_LENGTH }, () => {
    const randomIndex = Math.floor(Math.random() * INVITE_CODE_ALPHABET.length)
    return INVITE_CODE_ALPHABET[randomIndex]
  }).join('')
}

 const normalizeInviteCode = (value: string) => {
  return value.trim().toUpperCase().replace(/\s+/g, '')
}


export { generateInviteCode, normalizeInviteCode }