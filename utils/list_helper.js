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
  const authorBlogCount = {}
  let _mostBlogs = undefined
  blogs.forEach((blog) => {
    if (authorBlogCount[blog.author]) authorBlogCount[blog.author] += 1
    else authorBlogCount[blog.author] = 1
  })
  const maxBlogs = Math.max(...Object.values(authorBlogCount))
  Object.entries(authorBlogCount).forEach(([key, value]) => {
    if (value === maxBlogs) {
      _mostBlogs = {
        author: key,
        blogs: value
      }
    }
  })
  return _mostBlogs
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}
