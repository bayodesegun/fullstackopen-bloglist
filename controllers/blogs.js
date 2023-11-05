const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response, next) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response, next) => {
  const blog = new Blog(request.body)
  const result = await blog.save()
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
