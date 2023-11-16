const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')


blogsRouter.get('/', async (request, response, next) => {
  const blogs = await Blog.find({}).populate('user', { 'username': 1, 'name': 1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'Invalid token' })
  }

  const user = await User.findById(decodedToken.id)
  const blog = new Blog({
    ...request.body,
    user: user._id,
  })

  const result = await blog.save()

  user.blogs = user.blogs.concat(result._id)
  user.save()

  response.status(201).json(result)
})

blogsRouter.delete('/:id', async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'Invalid token' })
  }

  const user = await User.findById(decodedToken.id)

  const id = request.params.id
  const blog = await Blog.findById(id)

  if (!blog.user || blog.user.toString() !== user._id.toString()) {
    return response.status(403).json({ error: 'Access denied. You can only delete your own blogs!' })
  }

  await Blog.findByIdAndRemove(id)

  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response, next) => {
  const id = request.params.id
  const body = request.body
  const updatedBlog = await Blog.findByIdAndUpdate(
    id, body, { new: true, runValidators: true, context: 'query' },
  )
  response.status(200).json(updatedBlog)
})

module.exports = blogsRouter
