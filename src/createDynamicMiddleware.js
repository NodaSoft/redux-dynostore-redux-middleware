import { compose } from 'redux';
import _mapKeys from 'lodash/mapKeys';
import _omit from 'lodash/omit';
import _values from 'lodash/values';

/**
 * Create dynastore handler for dynamic middlewares
 */
export default () => createHandlers => (store, ...params) => {
  let dynamicMiddlewares = {};

  const enhancer = store => next => action => {
    const chain = _values(_mapKeys(dynamicMiddlewares, middleware => middleware(store)));
    return compose(...chain)(next)(action);
  };

  const attachMiddleware = (middleware, key) => {
    dynamicMiddlewares = {
      ...dynamicMiddlewares,
      [key]: middleware,
    };
  };

  const attachMiddlewares = (middlewares) => {
    dynamicMiddlewares = {
      ...dynamicMiddlewares,
      ...middlewares
    };
  };

  const detachMiddleware = (...keys) => {
    dynamicMiddlewares = _omit(dynamicMiddlewares, keys);
  };

  const resetMiddlewares = () => {
    dynamicMiddlewares = {};
    dynamicMiddlewareRunner(dynamicMiddlewares);
  };

  const handlers = createHandlers(store, ...params);
  return {
    ...handlers,
    dynamicMiddlewaresEnhancer: enhancer,
    attachMiddleware,
    attachMiddlewares,
    detachMiddleware,
    resetMiddlewares,
  };
};
