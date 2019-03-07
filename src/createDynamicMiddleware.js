import { compose } from 'redux';
import _omit from 'lodash/omit';
/**
 * Action types for logger
 * @type {string}
 */
const PREFIX = '@@DYNOSTORE/MIDDLEWARES';
const ATTACH_MIDDLEWARES = `${PREFIX}/ATTACH_MIDDLEWARES`;
const DETACH_MIDDLEWARES = `${PREFIX}/DETACH_MIDDLEWARES`;
const RESET_MIDDLEWARES = `${PREFIX}/RESET_MIDDLEWARES`;
const UNKNOWN_TYPE = `${PREFIX}/UNKNOWN_TYPE`;
/**
 * Action type map
 */
const actionTypes = {
  attach: ATTACH_MIDDLEWARES,
  detach: DETACH_MIDDLEWARES,
  reset: RESET_MIDDLEWARES,
  default: UNKNOWN_TYPE
};
const getActionName = type => actionTypes[type] ? actionTypes[type] : actionTypes.default;
const storeLogger = (store) => (type, params) => store.dispatch({ type: getActionName(type), ...params });
/**
 * Create dynostore handler for dynamic middlewares
 */
export default (createLogger = storeLogger) => createHandlers => (store, ...params) => {
  let dynamicMiddlewares = {};
  let log = createLogger(store);

  const enhancer = store => next => action => {
    const chain = Object.values(dynamicMiddlewares).map(middleware => middleware(store));
    return compose(...chain)(next)(action);
  };

  const attachMiddlewares = (middlewares) => {
    dynamicMiddlewares = {
      ...dynamicMiddlewares,
      ...middlewares
    };
    log('attach', { keys: Object.keys(middlewares) });
  };

  const detachMiddleware = (...keys) => {
    dynamicMiddlewares = _omit(dynamicMiddlewares, keys);
    log('detach', { keys });
  };

  const resetMiddlewares = () => {
    dynamicMiddlewares = {};
    log('reset');
  };

  const handlers = createHandlers(store, ...params);
  return {
    ...handlers,
    dynamicMiddlewaresEnhancer: enhancer,
    attachMiddlewares,
    detachMiddleware,
    resetMiddlewares,
  };
};
