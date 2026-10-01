const FAVORITES_KEY = 'coliving_favorites'

export const getFavorites = () => {
  try {
    const saved = localStorage.getItem(FAVORITES_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export const isFavorite = (id) => {
  return getFavorites().includes(id)
}

export const toggleFavorite = (id) => {
  if (!id) return false
  const favs = getFavorites()
  if (favs.includes(id)) {
    const newFavs = favs.filter(favId => favId !== id)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavs))
    return false
  } else {
    favs.push(id)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs))
    return true
  }
}
