import PocketBase from 'pocketbase'

const pbUrl = import.meta.env.VITE_PB_URL || 'http://gmo021.cansportsvg.com:8090'

export const pb = new PocketBase(pbUrl)

// Disable auto cancellation (for public access)
pb.autoCancellation(false)

export default pb

