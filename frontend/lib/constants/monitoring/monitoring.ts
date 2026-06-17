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

export const ENV_BADGE = {
  PRODUCTION: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  STAGING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  DEVELOPMENT: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
} as const;

export const ENV_LABEL = {
  PRODUCTION: 'Production',
  STAGING: 'Staging',
  DEVELOPMENT: 'Development',
} as const;

export const NETWORK_LABEL = {
  WIFI: 'Wi-Fi / LAN',
  NETWORK_4G: '4G LTE',
  FAST_3G: 'Fast 3G',
  NETWORK_3G: '3G Connection',
} as const;