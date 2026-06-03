export function parsePagination(query, defaultLimit = 25) {
  const limit = Math.min(Math.max(1, parseInt(query.limit) || defaultLimit), 200)
  const offset = Math.max(0, parseInt(query.offset) || 0)
  return { limit, offset }
}

export function buildPageLinks(basePath, limit, offset, total) {
  const lastOffset = total > 0 ? Math.max(0, (Math.ceil(total / limit) - 1) * limit) : 0
  const links = {
    self: `${basePath}?limit=${limit}&offset=${offset}`,
    first: `${basePath}?limit=${limit}&offset=0`,
    last: `${basePath}?limit=${limit}&offset=${lastOffset}`
  }
  if (offset + limit < total) links.next = `${basePath}?limit=${limit}&offset=${offset + limit}`
  if (offset > 0) links.prev = `${basePath}?limit=${limit}&offset=${Math.max(0, offset - limit)}`
  return links
}
