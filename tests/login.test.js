const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app.js')

const api = supertest(app)
const helper = require('./test_helper.js')
const User = require('../models/user.js')


beforeEach(async () => {
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('pwd.user', 10)
  const user = new User({
    username: 'user',
    name: 'User',
    passwordHash,
  })
  await user.save()
})

describe('login endpoint', () => {
  test('succeeds with a correct username and password', async () => {

    const login = {
      username: 'user',
      password: 'pwd.user'
    }

    const response = await api
      .post('/api/login')
      .set('Accept', 'application/json')
      .send(login)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const auth = response.body
    expect(auth.name).toBe('User')
    expect(auth.username).toBe('user')
    expect(auth.token).toBeDefined()
    expect(auth.token.length).toBeGreaterThan(10)
  })

  test('fails with an incorrect username', async () => {

    const login = {
      username: 'user1',
      password: 'pwd.user'
    }

    const response = await api
      .post('/api/login')
      .set('Accept', 'application/json')
      .send(login)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    const auth = response.body
    expect(auth.name).not.toBeDefined()
    expect(auth.username).not.toBeDefined()
    expect(auth.error).toContain('Invalid')
  })

  test('fails with an incorrect password', async () => {

    const login = {
      username: 'user',
      password: 'pwd.1user'
    }

    const response = await api
      .post('/api/login')
      .set('Accept', 'application/json')
      .send(login)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    const auth = response.body
    expect(auth.name).not.toBeDefined()
    expect(auth.username).not.toBeDefined()
    expect(auth.error).toContain('Invalid')
  })

})

afterAll(async () => {
  await mongoose.connection.close()
})
