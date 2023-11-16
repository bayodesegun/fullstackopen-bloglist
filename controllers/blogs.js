const blogsRouter = require('express').Router()
const Blog = require('../models/blog')


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { 'username': 1, 'name': 1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const user = request.user
  const blog = new Blog({
    ...request.body,
    user: user._id,
  })

  const result = await blog.save()
  user.blogs = user.blogs.concat(result._id)
  user.save()

  response.status(201).json(result)
})

blogsRouter.delete('/:id', async (request, response) => {
  const user = request.user
  const id = request.params.id
  const blog = await Blog.findById(id)

  if (!blog) {
    return response.status(404).json({ error: 'Blog not found' })
  }

  if (!blog.user || blog.user.toString() !== user._id.toString()) {
    return response.status(403).json({ error: 'Access denied. You can only delete your own blogs!' })
  }

  await Blog.findByIdAndRemove(id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const id = request.params.id
  const body = request.body
  const updatedBlog = await Blog.findByIdAndUpdate(
    id, body, { new: true, runValidators: true, context: 'query' },
  )
  response.status(200).json(updatedBlog)
})

module.exports = blogsRouter
