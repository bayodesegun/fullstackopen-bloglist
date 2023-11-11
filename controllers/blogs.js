const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response, next) => {
  const blogs = await Blog.find({}).populate('user', { 'username': 1, 'name': 1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response, next) => {
  const blog = new Blog(request.body)

  const firstUser = (await User.find({})).at(0)
  blog.user = firstUser._id

  const result = await blog.save()

  firstUser.blogs = firstUser.blogs.concat(result._id)
  firstUser.save()

  response.status(201).json(result)
})

blogsRouter.delete('/:id', async (request, response, next) => {
  const id = request.params.id
  await Blog.findByIdAndDelete(id)
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
