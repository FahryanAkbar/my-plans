export const ENVIRONMENTS = {
  PRODUCTION: 'PRODUCTION',
  STAGING: 'STAGING',
  DEVELOPMENT: 'DEVELOPMENT',
} as const

export const NETWORK_PROFILES = {
  WIFI: 'WIFI',
  NETWORK_4G: 'NETWORK_4G',
  NETWORK_3G: 'NETWORK_3G',
  FAST_3G: 'FAST_3G',
} as const

export const ENGINES = {
  PUPPETEER: 'PUPPETEER',
  PLAYWRIGHT: 'PLAYWRIGHT',
  HTTP: 'HTTP',
}

export type Environment = (typeof ENVIRONMENTS)[keyof typeof ENVIRONMENTS]
export type NetworkProfile = (typeof NETWORK_PROFILES)[keyof typeof NETWORK_PROFILES]
export type Engine = (typeof ENGINES)[keyof typeof ENGINES]