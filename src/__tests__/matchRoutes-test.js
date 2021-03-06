import { expect } from 'chai'
import match from '../matchRoutes'
import patternMatcher from '../patternMatcher'

describe('matchRoutes', () => {
  it('returns an array', () => {
    const result = match({ routes: [], path: '/' })
    expect(result).to.eql([])
  })

  it('returns matched routes', () => {
    const routes = [{ path: '/foo', name: 'foo' }]
    const matches = match({ routes, path: '/foo' })
    expect(matches[0].route).to.eql(routes[0])
  })

  it('stops matching after the first exact match', () => {
    const routes = [
      { path: '/foo', name: 'foo' },
      { path: '/foo', name: 'bar' },
    ]
    const matches = match({ routes, path: '/foo' })
    expect(matches).to.eql([{
      route: routes[0],
      path: '/foo',
      params: {},
      index: '0',
    }])
  })

  it('matches nested routes', () => {
    const routes = [{
      path: '/foo',
      name: 'foo',
      routes: [{
        path: '/bar',
        name: 'bar',
      }],
    }]
    const matches = match({ routes, path: '/foo/bar' })
    expect(matches[0].route).to.eql(routes[0])
    expect(matches[1].route).to.eql(routes[0].routes[0])
  })

  it('handles nested index routes', () => {
    const routes = [{
      name: 'foo',
      path: '/',
      routes: [{
        path: '/',
        name: 'bar',
      }],
    }]
    const matches = match({ routes, path: '/' })
    expect(matches[0].route).to.eql(routes[0])
    expect(matches[1].route).to.eql(routes[0].routes[0])
  })

  it('does not require a path for parent or index routes', () => {
    const routes = [{
      name: 'foo',
      routes: [{
        path: '/bar',
        name: 'bar',
        routes: [{
          name: 'baz',
        }],
      }],
    }]
    const matches = match({ routes, path: '/bar' })
    expect(matches[0].route).to.eql(routes[0])
    expect(matches[1].route).to.eql(routes[0].routes[0])
    expect(matches[2].route).to.eql(routes[0].routes[0].routes[0])
  })

  it('returns route params', () => {
    const routes = [{
      path: '/:foo',
      routes: [{
        path: '/:bar',
      }],
    }]
    const matches = match({ routes, path: '/foo/bar' })
    expect(matches[0].params).to.eql({ foo: 'foo' })
    expect(matches[1].params).to.eql({ foo: 'foo', bar: 'bar' })
  })

  it('returns the matched path', () => {
    const routes = [{
      path: '/foo',
      routes: [{
        path: '/bar',
      }],
    }]
    const matches = match({ routes, path: '/foo/bar' })
    expect(matches[0].path).to.equal('/foo')
    expect(matches[1].path).to.equal('/foo/bar')
  })

  it('returns the original route object', () => {
    const routes = [{
      path: '/foo',
      routes: [{
        path: '/bar',
      }],
    }]
    const result = match({ routes, path: '/foo/bar' })
    expect(result[0].route).to.equal(routes[0])
    expect(result[1].route).to.equal(routes[0].routes[0])
  })

  it('returns a index for the route', () => {
    const routes = [{
      path: '/foo',
      routes: [{
        path: '/bar',
        routes: [{
          path: '/boo',
        }, {
          path: '/baz',
        }],
      }],
    }]
    const result = match({ routes, path: '/foo/bar/baz' })
    expect(result[0].index).to.equal('0')
    expect(result[1].index).to.equal('0.0')
    expect(result[2].index).to.equal('0.0.1')
  })

  it('matches nested routes when not strict', () => {
    const routes = [{
      path: '/foo',
      name: 'foo',
      routes: [{
        path: '/bar',
        name: 'bar',
      }],
    }]
    const matches = match({
      routes,
      path: '/foo/bar/',
      strict: false,
      matcher: patternMatcher(),
    })
    expect(matches[0].route).to.eql(routes[0])
    expect(matches[1].route).to.eql(routes[0].routes[0])
  })
})
