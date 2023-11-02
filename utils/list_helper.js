const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, item) => sum + item.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length < 1) return {}
  const maxLike = Math.max(...blogs.map((blog) => blog.likes))
  return blogs.filter((blog) => blog.likes === maxLike)[0]
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}
