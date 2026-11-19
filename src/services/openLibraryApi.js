export async function searchOpenLibrary(query) {
  const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=8`)
  if (!response.ok) throw new Error('Open Library is not responding. Please try again later.')
  const result = await response.json()
  return result.docs || []
}
