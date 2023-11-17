const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const testHelper = require('./test_helper.js')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


// Get three out of the test blogs
const testBlogs = testHelper.testBlogs.slice(0, 3)

// unauthenticated version of the api
const api = supertest(app)

// authenticated version of the api
const apiAuth = supertest.agent(app)

// auth header
const getAuthHeader = async (user) => {
  const userForToken = {
    username: user.username,
    id: user._id,
  }

  return jwt.sign(
    userForToken,
    process.env.SECRET,
    { expiresIn: 60 * 60 }
  )
}

const createUsers = async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('whatever', 10)
  const authUser = new User({ username: 'AuthUser', name: 'Auth User', passwordHash })
  await authUser.save()

  const blogUser = new User({ username: 'BlogUser', name: 'Blog User', passwordHash })
  await blogUser.save()

  const authHeader = await getAuthHeader(authUser)
  apiAuth.auth(authHeader, {type: 'bearer'})
}

const createBlogs = async () => {
  await Blog.deleteMany({})
  const blogUser = await User.findOne({ username: 'BlogUser' })
  for (let blog of testBlogs) {
    await new Blog({
      ...blog,
      user: blogUser._id,
    }).save()
  }
}


beforeAll(async () => {
  await createUsers()
}, 100000)


beforeEach(async () => {
  await createBlogs()
}, 100000)

describe('blog list endpoint', () => {
  test('returns list as json with code 200 OK', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('returns the right number of blogs', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(3)
  })

  test('returns blogs with unique IDs named "id"', async () => {
    const response = await api.get('/api/blogs')
    const blogs = response.body
    let prevId = 'someRandomId'
    for (let blog of blogs) {
      expect(blog.id).toBeDefined()
      expect(blog.id).not.toBe(prevId)
      prevId = blog.id
    }
  })

  test('returns blogs with user information', async () => {
    const allBlogs = await Blog.find({})
    const user = await User.findOne({})
    for (let blog of allBlogs) {
      blog.user = user._id
      await blog.save()
    }
    const response = await api.get('/api/blogs')
    const blogs = response.body
    for (let blog of blogs) {
      expect(blog.user).toBeDefined()
      expect(blog.user.username).toBe(user.username)
      expect(blog.user.name).toBe(user.name)
    }
  })
})

describe('blog create endpoint', () => {
  test('returns a 401 if authentication information is missing', async () => {
    const blog = {
      title: 'Test blog',
      author: 'Jest',
      likes: 10
    }
    const response = await api
      .post('/api/blogs')
      .send(blog)
      .set('Accept', 'application/json')
      .expect(401)

    const dbBlogs = await testHelper.blogsInDb()
    expect(dbBlogs).toHaveLength(testBlogs.length)
  })

  test('correctly creates a blog, returns jsons and code 201 created', async () => {
    const blog = {
      title: 'Test blog',
      author: 'Jest',
      likes: 10
    }
    const response = await apiAuth
      .post('/api/blogs')
      .send(blog)
      .set('Accept', 'application/json')
      .expect(201)
      .expect('Content-Type', /application\/json/)

    createdBlog = response.body
    expect(createdBlog.title).toBe('Test blog')
    expect(createdBlog.author).toBe('Jest')
    expect(createdBlog.likes).toBe(10)
    expect(createdBlog.id).toBeDefined()

    const dbBlogs = await testHelper.blogsInDb()
    expect(dbBlogs).toHaveLength(testBlogs.length + 1)
  })

  test('sets likes to 0 if not specified in the request', async () => {
    const blog = {
      title: 'Test blog without likes',
      author: 'Jester',
    }
    const response = await apiAuth
      .post('/api/blogs')
      .send(blog)
      .set('Accept', 'application/json')
      .expect(201)
      .expect('Content-Type', /application\/json/)

    createdBlog = response.body
    expect(createdBlog.likes).toBe(0)
  })

  test('returns a 400 bad request if blog title is missing', async () => {
    const blog = {
      author: 'Titleless Author',
      likes: 2
    }
    await apiAuth
      .post('/api/blogs')
      .send(blog)
      .set('Accept', 'application/json')
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const dbBlogs = await testHelper.blogsInDb()
    expect(dbBlogs).toHaveLength(testBlogs.length)
  })

  test('returns a 400 bad request if blog author is missing', async () => {
    const blog = {
      title: 'Authorless blog',
      likes: 2
    }
    await apiAuth
      .post('/api/blogs')
      .send(blog)
      .set('Accept', 'application/json')
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const dbBlogs = await testHelper.blogsInDb()
    expect(dbBlogs).toHaveLength(testBlogs.length)
  })

  test('contains user information', async () => {
    const blog = {
      title: 'Author1 blog',
      author: 'Author1',
      likes: 2
    }
    const response = await apiAuth
      .post('/api/blogs')
      .send(blog)
      .set('Accept', 'application/json')
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const createdBlog = response.body
    expect(createdBlog.user).toBeDefined()
    const user = await User.findById(createdBlog.user)
    expect(user.blogs.length).toBeGreaterThanOrEqual(1)
    const userBlogs = user.blogs.map(b => b.valueOf())
    expect(userBlogs).toContain(createdBlog.id)
  })
})

describe('blog delete endpoint', () => {
  test('returns a 401 if the user is not authenticated', async () => {
    const initialBlogs = await testHelper.blogsInDb()
    const id = initialBlogs[0].id
    await api
      .delete(`/api/blogs/${id}`)
      .expect(401)

    const dbBlogs = await testHelper.blogsInDb()
    expect(dbBlogs).toHaveLength(testBlogs.length)
  })

  test('authenticated user cannot delete 3rd party blogs', async () => {
    // get a blog not created by the authenticated user
    const initialBlogs = await testHelper.blogsInDb()
    const id = initialBlogs[0].id

    await apiAuth
      .delete(`/api/blogs/${id}`)
      .expect(403)

    const dbBlogs = await testHelper.blogsInDb()
    expect(dbBlogs).toHaveLength(testBlogs.length)
  })

  test('authenticated user can delete own blog', async () => {
    // get a blog created by the authenticated user
    const authUser = await User.findOne({ username: 'AuthUser' })
    await new Blog({
      title: 'Auth User blog',
      author: 'Auth User',
      likes: 2,
      user: authUser._id
    }).save()

    const currentBlogs = await testHelper.blogsInDb()
    expect(currentBlogs).toHaveLength(testBlogs.length + 1)

    const blog = await Blog.findOne({ title: 'Auth User blog' })
    const id = blog._id

    await apiAuth
      .delete(`/api/blogs/${id}`)
      .expect(204)

    const finalBlogs = await testHelper.blogsInDb()
    expect(finalBlogs).toHaveLength(testBlogs.length)
  })

  test('raises a 400 bad request error if the ID is invalid', async () => {
    const id = 'abcd1256'
    await apiAuth
      .delete(`/api/blogs/${id}`)
      .expect(400)

    const dbBlogs = await testHelper.blogsInDb()
    expect(dbBlogs).toHaveLength(testBlogs.length)
  })
})

describe('blog update endpoint', () => {
  test('returns a 401 if authentication is missing', async () => {
    const currentBlogs = await testHelper.blogsInDb()
    const blog = currentBlogs[0]
    const blogUpdate = {
      title: 'Auth User blog',
      author: 'Auth User',
      likes: 100
    }
    await api
      .put(`/api/blogs/${blog.id}`)
      .send(blogUpdate)
      .set('Accept', 'application/json')
      .expect(401)
  })

  test('cannot update a 3rd party blog', async () => {
    const currentBlogs = await testHelper.blogsInDb()
    const blog = currentBlogs[0]
    const blogUpdate = {
      title: 'Auth User blog',
      author: 'Auth User',
      likes: 100
    }
    await apiAuth
      .put(`/api/blogs/${blog.id}`)
      .send(blogUpdate)
      .set('Accept', 'application/json')
      .expect(403)
  })

  test('user can update own blog, returns json and 200 OK', async () => {
    const authUser = await User.findOne({ username: 'AuthUser' })
    await new Blog({
      title: 'Auth User blog',
      author: 'Auth User',
      likes: 2,
      user: authUser._id
    }).save()

    const blog = await Blog.findOne({ title: 'Auth User blog' })
    const blogUpdate = {
      title: 'Auth User blog',
      author: 'Auth User',
      likes: 100
    }
    const response = await apiAuth
      .put(`/api/blogs/${blog._id}`)
      .send(blogUpdate)
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const updatedBlog = response.body
    expect(updatedBlog.likes).toBe(100)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
