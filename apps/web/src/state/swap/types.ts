export type PairDataNormalized = {
  time: number
  token0Id: string
  token1Id: string
  reserve0: number
  reserve1: number
}[]

export type DerivedPairDataNormalized = {
  time: number
  token0Id: string
  token1Id: string
  token0DerivedUSD: number
  token1DerivedUSD: number
}[]

export type PairPricesNormalized = {
  time: Date
  value: number
}[]

export type PairCandlesNormalized = {
  time: number
  open: number
  high: number
  low: number
  close: number
}[]

export enum PairDataTimeWindowEnum {
  MINUTE,
  FIVE_MINUTES,
  TEN_MINUTES,
  HOUR,
  DAY,
  WEEK,
  MONTH,
  YEAR,
}
