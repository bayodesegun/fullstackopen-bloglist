const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)
const listHelper = require('../utils/list_helper')
const Blog = require('../models/blog')

// Get three out of the test blogs
const testBlogs = listHelper.allBlogs.slice(0, 3)

beforeAll(async () => {
  await Blog.deleteMany({})
  for (let blog of testBlogs) {
    const blog_ = Blog(blog)
    await blog_.save()
  }
}, 100000)

describe('blogs list', () => {
  test('returns list as json with code 200 OK', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

  }, 100000)

  test('returns the right number of blogs', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(3)
  }, 100000)

  test('returns blogs with unique IDs named "id"', async () => {
    const response = await api.get('/api/blogs')
    const blogs = response.body
    let prevId = 'someRandomId'
    for (let blog of blogs) {
      expect(blog.id).toBeDefined()
      expect(blog.id).not.toBe(prevId)
      prevId = blog.id
    }
  }, 100000)
})

afterAll(async () => {
  await mongoose.connection.close()
})
