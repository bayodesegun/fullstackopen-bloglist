const listHelper = require('../utils/list_helper')
const testHelper = require('./test_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe('total likes', () => {
  test('of empty list is zero', () => {
    const blogs = []

    const result = listHelper.totalLikes(blogs)
    expect(result).toBe(0)
  })

  test('when list has only one blog, equals the likes of that', () => {
    const blogs = [testHelper.testBlogs[0]]

    const result = listHelper.totalLikes(blogs)
    expect(result).toBe(7)
  })

  test('of a bigger list is calculated right', () => {
    const blogs = testHelper.testBlogs

    const result = listHelper.totalLikes(blogs)
    expect(result).toBe(36)
  })
})

describe('favorite blog', () => {
  test('of empty list is undefined', () => {
    const blogs = []

    const result = listHelper.favoriteBlog(blogs)
    expect(result).toEqual(undefined)
  })

  test('when list has only one blog, equals that blog', () => {
    const blogs = [testHelper.testBlogs[0]]

    const result = listHelper.favoriteBlog(blogs)
    expect(result).toEqual(blogs[0])
  })

  test('of a bigger list is calculated right', () => {
    const blogs = testHelper.testBlogs

    const result = listHelper.favoriteBlog(blogs)
    expect(result).toEqual(testHelper.testBlogs[2])
  })
})

describe('most blogs', () => {
  test('of empty list is undefined', () => {
    const blogs = []

    const result = listHelper.mostBlogs(blogs)
    expect(result).toEqual(undefined)
  })

  test('when list has only one blog, equals its author with 1 blog', () => {
    const blogs = [testHelper.testBlogs[0]]
    const _result = {
      author: testHelper.testBlogs[0].author,
      blogs: 1
    }
    const result = listHelper.mostBlogs(blogs)
    expect(result).toEqual(_result)
  })

  test('of a bigger list is calculated right', () => {
    const blogs = testHelper.testBlogs
    const _result = {
      author: 'Robert C. Martin',
      blogs: 3
    }
    const result = listHelper.mostBlogs(blogs)
    expect(result).toEqual(_result)
  })
})

describe('most likes', () => {
  test('of empty list is undefined', () => {
    const blogs = []

    const result = listHelper.mostLikes(blogs)
    expect(result).toEqual(undefined)
  })

  test('when list has only one blog, equals its author with its likes', () => {
    const blogs = [testHelper.testBlogs[0]]
    const _result = {
      author: testHelper.testBlogs[0].author,
      likes: 7
    }
    const result = listHelper.mostLikes(blogs)
    expect(result).toEqual(_result)
  })

  test('of a bigger list is calculated right', () => {
    const blogs = testHelper.testBlogs
    const _result = {
      author: 'Edsger W. Dijkstra',
      likes: 17
    }
    const result = listHelper.mostLikes(blogs)
    expect(result).toEqual(_result)
  })
})
