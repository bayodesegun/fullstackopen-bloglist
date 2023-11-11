const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app.js')

const api = supertest(app)
const helper = require('./test_helper.js')
const User = require('../models/user.js')
const Blog = require('../models/blog.js')

const seed = [1, 2, 3]

beforeEach(async () => {
  await User.deleteMany({})
  const users = seed.map((element) =>
    ({
      username: `user${element}`,
      name: `User${element}`,
      passwordHash: '<PASSWORD>',
    })
  )
  await User.insertMany(users)
})

describe('user create endpoint', () => {
  test('succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'bayode',
      name: 'Segun',
      password: 'who5793fhsf',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('username must have a minimum length of 3', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'ba',
      name: 'Segun',
      password: 'who5793fhsf',
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    expect(response.text).toContain('validation failed')
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('password must have a minimum length of 3', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'bayo',
      name: 'Segun',
      password: 'wh',
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    expect(response.text).toContain('validation failed')
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('username must be unique', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: seed.map((element) => `user${element}`).pop(),
      name: 'Root',
      password: 'pwdrtoo',
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    expect(response.text).toContain('validation failed')
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

})

describe('user list endpoint', () => {
  test('listing users works correctly', async () => {
    const usersAtStart = await helper.usersInDb()

    const response = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = response.body
    expect(usersAtEnd).toHaveLength(usersAtStart.length)

    const usernames = usersAtEnd.map(u => u.username)
    const expectedUsers = seed.map((element) => `user${element}`)
    expect(usernames).toEqual(expectedUsers)
  })

  test('list has blogs information', async () => {
    const usersAtStart = await User.find({})

    for (let user of usersAtStart) {
      const blogs = seed.map((element) =>
        ({
          title: `blog${element} ${user.name}`,
          author: user.name,
          url: `http://${user.username}.blog${element}.com`,
          likes: element,
        })
      )
      savedBlogs = await Blog.insertMany(blogs)
      user.blogs = savedBlogs.map(blog => blog._id)
      await user.save()
    }

    const response = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = response.body
    expect(usersAtEnd).toHaveLength(usersAtStart.length)

    for (let user of usersAtEnd) {
      expect(user.blogs).toHaveLength(3)
      for (let blog of user.blogs) {
        expect(blog.title).toContain(user.name)
        expect(blog.author).toBe(user.name)
        expect(blog.url).toContain(user.username)
      }
    }
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
