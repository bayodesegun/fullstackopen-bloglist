const allBlogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0
  }
]

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
  allBlogs,
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
