import useSWRImmutable from 'swr/immutable'

/**
 * Check if asset exists on CMC, if exists
 * return url, if not return undefined
 * @param address token address (all lowercase, checksummed are not supported by CMC)
 */
const useCMCLink = (address: string): string | undefined => {
  const { data: cmcPageUrl } = useSWRImmutable(address ? ['cmcLink', address] : null, async () => {
    const response = await fetch(`/api/cmc/link/${address.toLowerCase()}`)

    if (response.ok) {
      return (await response.json()).url
    }
    return undefined
  })

  return cmcPageUrl
}

export default useCMCLink
