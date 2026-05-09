import { PairDataTimeWindowEnum } from '../types'

// Specifies the amount of data points to query for specific time window
export const timeWindowIdsCountMapping: Record<PairDataTimeWindowEnum, number> = {
  [PairDataTimeWindowEnum.MINUTE]: 60,
  [PairDataTimeWindowEnum.FIVE_MINUTES]: 72,
  [PairDataTimeWindowEnum.TEN_MINUTES]: 72,
  [PairDataTimeWindowEnum.HOUR]: 24,
  [PairDataTimeWindowEnum.DAY]: 24,
  [PairDataTimeWindowEnum.WEEK]: 28,
  [PairDataTimeWindowEnum.MONTH]: 30,
  [PairDataTimeWindowEnum.YEAR]: 24,
}

// How many StreamingFast ids to skip when querying the data
export const timeWindowGapMapping: Record<PairDataTimeWindowEnum, number | null> = {
  [PairDataTimeWindowEnum.MINUTE]: null,
  [PairDataTimeWindowEnum.FIVE_MINUTES]: null,
  [PairDataTimeWindowEnum.TEN_MINUTES]: null,
  [PairDataTimeWindowEnum.HOUR]: null,
  [PairDataTimeWindowEnum.DAY]: null,
  [PairDataTimeWindowEnum.WEEK]: 6, // Each datapoint 6 hours apart
  [PairDataTimeWindowEnum.MONTH]: 1, // Each datapoint 1 day apart
  [PairDataTimeWindowEnum.YEAR]: 15, // Each datapoint 15 days apart
}
