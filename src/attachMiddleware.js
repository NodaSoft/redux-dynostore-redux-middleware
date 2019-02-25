export default (middleware) => identifier => store => {
  if (process.env.NODE_ENV !== 'production' && typeof store.attachMiddlewares !== 'function') {
    throw new TypeError(`'store.attachMiddlewares' function is missing: Unable to attach middleware '${identifier}'.`)
  }
  store.attachMiddlewares({ [identifier]: middleware });
};
