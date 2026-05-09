import { gql } from 'graphql-request'

const pairSwapDatas = gql`
  query pairSwapDatas($pairId: String!, $timestampGte: Int!, $first: Int!, $skip: Int!) {
    swaps(
      first: $first
      skip: $skip
      where: { pair: $pairId, timestamp_gte: $timestampGte }
      orderBy: timestamp
      orderDirection: asc
    ) {
      id
      timestamp
      amount0In
      amount1In
      amount0Out
      amount1Out
      pair {
        token0 {
          id
        }
        token1 {
          id
        }
      }
    }
  }
`

export default pairSwapDatas
