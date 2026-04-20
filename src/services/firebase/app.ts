import { initializeApp } from 'firebase/app'
import { getFunctions } from 'firebase/functions'
import { getFirestore } from 'firebase/firestore'

const getRequiredEnv = (name: keyof ImportMetaEnv) => {
  const value = import.meta.env[name]

  if (!value) {
    throw new Error(`Missing Firebase environment variable: ${name}`)
  }

  return value
}

const getOptionalEnv = (name: keyof ImportMetaEnv) => {
  const value = import.meta.env[name]

  if (typeof value !== 'string') {
    return ''
  }

  return value.trim()
}

const firebaseConfig = {
  apiKey: getRequiredEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getRequiredEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getRequiredEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getRequiredEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getRequiredEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getRequiredEnv('VITE_FIREBASE_APP_ID'),
}

const firebaseApp = initializeApp(firebaseConfig)
const db = getFirestore(firebaseApp)
const firebaseFunctions = getFunctions(firebaseApp)
const firebaseWebPushVapidKey = getOptionalEnv('VITE_FIREBASE_VAPID_KEY')

export { db, firebaseApp, firebaseConfig, firebaseFunctions, firebaseWebPushVapidKey }
