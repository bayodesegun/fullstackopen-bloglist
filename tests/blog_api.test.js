const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)
const listHelper = require('../utils/list_helper')
const Blog = require('../models/blog')


beforeEach(async () => {
  await Blog.deleteMany({})
  for (let blog of listHelper.allBlogs.slice(0, 3)) {
    const blog_ = Blog(blog)
    await blog_.save()
  }
}, 100000)

test('blogs are returned as json', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(response.body).toHaveLength(3)
}, 100000)

afterAll(async () => {
  await mongoose.connection.close()
})
