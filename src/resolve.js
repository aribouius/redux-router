const noop = () => {}

export default (routes, ctx) => (
  routes.reduceRight((next, { resolve, ...route }) => (() => {
    if (resolve) {
      return resolve(route, ctx, next || noop)
    } else {
      return next === noop ? route : next()
    }
  }), noop)()
)