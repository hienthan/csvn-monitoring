import PocketBase from 'pocketbase'

const pbUrl = import.meta.env.VITE_PB_URL || 'http://10.1.16.89:8090'

export const pb = new PocketBase(pbUrl)

// Disable auto cancellation (for public access)
pb.autoCancellation(false)

export default pb

