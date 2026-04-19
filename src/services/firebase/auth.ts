import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { firebaseApp } from '@/services/firebase/app'

const firebaseAuth = getAuth(firebaseApp)
const googleProvider = new GoogleAuthProvider()

export { firebaseAuth, googleProvider }
