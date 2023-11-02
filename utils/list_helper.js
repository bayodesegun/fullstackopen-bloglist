const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, item) => sum + item.likes, 0)
}

const favoriteBlog = (blogs) => {
  const maxLike = Math.max(...blogs.map((blog) => blog.likes))
  return blogs.filter((blog) => blog.likes === maxLike)[0]
}

const mostBlogs = (blogs) => {
  const authorBlogs = {}
  let _mostBlogs = undefined
  blogs.forEach((blog) => {
    if (authorBlogs[blog.author]) authorBlogs[blog.author] += 1
    else authorBlogs[blog.author] = 1
  })
  const maxBlogs = Math.max(...Object.values(authorBlogs))
  Object.entries(authorBlogs).forEach(([key, value]) => {
    if (value === maxBlogs) {
      _mostBlogs = {
        author: key,
        blogs: value
      }
    }
  })
  return _mostBlogs
}

const mostLikes = (blogs) => {
  const authorLikes = {}
  let _mostLikes = undefined
  blogs.forEach((blog) => {
    if (authorLikes[blog.author]) authorLikes[blog.author] += blog.likes
    else authorLikes[blog.author] = blog.likes
  })
  const maxLikes = Math.max(...Object.values(authorLikes))
  Object.entries(authorLikes).forEach(([key, value]) => {
    if (value === maxLikes) {
      _mostLikes = {
        author: key,
        likes: value
      }
    }
  })
  return _mostLikes
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
