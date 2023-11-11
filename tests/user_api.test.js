const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app.js')

const api = supertest(app)
const helper = require('./test_helper.js')
const User = require('../models/user.js')


beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })

  await user.save()
})

describe('when there is initially one user in db', () => {

  test('creation succeeds with a fresh username', async () => {
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

  test('listing users works correctly', async () => {
    const usersAtStart = await helper.usersInDb()

    var users = []
    const seed = [1, 2, 3]
    seed.forEach(async (element) => {
      const newUser = {
        username: `user${element}`,
        name: `User${element}`,
        passwordHash: '<PASSWORD>',
      }
      users.push(newUser)
    })
    await User.insertMany(users)

    const response = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await response.body
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 3)

    const usernames = usersAtEnd.map(u => u.username).filter(u => u!== 'root')
    const expectedUsers = seed.map((element) => `user${element}`)
    expect(usernames).toEqual(expectedUsers)
  })
})

describe('Invalid users are not created', () => {

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
      username: 'root',
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

afterAll(async () => {
  await mongoose.connection.close()
})
