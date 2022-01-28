// Inspired by https://github.com/reachifyio/dataloader-sort
// Simplified to only support number and string keys, which helps with types.

const sortByKeys = <T extends Record<string, unknown>>(
  keys: (number | string)[],
  data: T[],
  prop = "id"
): (T | null)[] => {
  const normalizedData: Record<number | string, T> = {}

  data.forEach((d) => {
    const key = d[prop]
    if (typeof key !== "number" && typeof key !== "string") {
      throw new Error(`Invalid key ${String(key)}`)
    }
    if (normalizedData[key]) {
      throw new Error(`Multiple options in data matching key ${String(key)}`)
    }
    normalizedData[key] = d
  })

  // Could also return an error instead of null - not sure what is best here
  // https://github.com/graphql/dataloader/issues/169
  return keys.map((key) => normalizedData[key] || null)
}

export default sortByKeys
