const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)
const listHelper = require('../utils/list_helper')
const testHelper = require('./test_helper.js')
const Blog = require('../models/blog')

// Get three out of the test blogs
const testBlogs = testHelper.testBlogs.slice(0, 3)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(testBlogs)
}, 100000)

describe('blogs list endpoint', () => {
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
})

describe('blog create endpoint', () => {
  test('correctly creates a blog, returns jsons and code 201 created', async () => {
    const blog = {
      title: 'Test blog',
      author: 'Jest',
      likes: 10
    }
    const response = await api
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
    const response = await api
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
    await api
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
    await api
      .post('/api/blogs')
      .send(blog)
      .set('Accept', 'application/json')
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const dbBlogs = await testHelper.blogsInDb()
    expect(dbBlogs).toHaveLength(testBlogs.length)
  })
})

describe('blog delete endpoint', () => {
  test('correctly deletes a blog and returns code 204 no content', async () => {
    const initialBlogs = await testHelper.blogsInDb()
    const id = initialBlogs[0].id
    await api
      .delete(`/api/blogs/${id}`)
      .expect(204)

    const dbBlogs = await testHelper.blogsInDb()
    expect(dbBlogs).toHaveLength(testBlogs.length - 1)
    for (let blog of dbBlogs) {
      expect(blog.id).not.toEqual(id)
    }
  })

  test('raises a 400 bad request error if the ID is invalid', async () => {
    const id = 'abcdef123456'
    await api
      .delete(`/api/blogs/${id}`)
      .expect(400)

    const dbBlogs = await testHelper.blogsInDb()
    expect(dbBlogs).toHaveLength(testBlogs.length)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
