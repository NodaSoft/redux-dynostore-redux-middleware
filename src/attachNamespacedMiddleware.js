import attachMiddleware from './attachMiddleware';
import { namespacedAction, globalAction } from 'redux-subspace';

/**
 * Do action have namespace
 * @param action
 * @param namespace
 * @returns {boolean}
 */
const hasNamespace = (action, namespace) => !!action && !!action.type && action.type.indexOf(`${namespace}/`) === 0;
/**
 * Default redux prefix
 * @type {string}
 */
const REDUX_PREFIX = '@@redux/';
/**
 * Is an action global or namespaced
 * @param action
 * @returns {boolean}
 */
const isGlobal = (action) => !action.type || action.globalAction === true || action.type.startsWith(REDUX_PREFIX);
/**
 * Function create a handler for adaptation action toward middleware processing
 * action {object} original action
 * callback {Function(middlewareAction, originalAction)}
 * fallback {Function(action)} default callback escapes namespaced middleware
 *
 * @param namespace
 * @returns {Function(action, callback, fallback)}
 */
const processAction = (namespace) => (action, middleware, next) => {
  if (namespace && !isGlobal(action) && hasNamespace(action, namespace)) {
    // run middleware with modified next function which runs namespaced action
    return middleware((action) => next(globalAction(namespacedAction(namespace)(action))))({
      ...action,
      type: action.type.substring(namespace.length + 1)
    });
  }
  // fallback for global actions - no namespaced middlewares
  return next(action);
};
/**
 * Prepare runner for middleware
 * @param namespace
 * @returns {function(*=): function(*=): function(*=): function(*=): *}
 */
const namespaced = (namespace) => {
  const actionProcessor = processAction(namespace);
  return (middleware) => (store) => (next) => (action) => (
    actionProcessor(action, middleware(store), next)
  );
};


export default (middleware) => identifier => {
  const namespacedMiddleware = namespaced(identifier)(middleware);
  return store => {
    const storeNamespace = store.namespace;
    const namespacedIdentifier = storeNamespace ? `${storeNamespace}/${identifier}` : identifier;
    // const middlewareToAttach = storeNamespace ? namespaced(storeNamespace)(namespacedMiddleware) : namespacedMiddleware;
    return attachMiddleware(namespacedMiddleware(store))(namespacedIdentifier)(store);
  }
};
