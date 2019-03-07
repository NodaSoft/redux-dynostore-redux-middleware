import attachMiddleware from './attachMiddleware';
import { namespacedAction } from 'redux-subspace';
import { compose } from 'redux';
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
 * Detach actions prefix
 * @param namespace
 * @returns {function(*): {type: string}}
 */
const denamespacedAction = namespace => action => ({ ...action, type: action.type.substring(namespace.length + 1) });
/**
 * Function create a handler for adaptation action toward middleware processing
 * action {object} original action
 * @param namespace
 * @returns {function}
 */
const processAction = (namespace) => (action, middleware, next, store) => {
  if (namespace && !isGlobal(action) && hasNamespace(action, namespace)) {
    // Patch next function to add namespace to action
    const patchedNext = action => next(namespacedAction(namespace)(action));
    const patchedStore = {
      getState: () => store.getState()[namespace],
      dispatch: (action) => store.dispatch(namespacedAction(namespace)(action))
    };
    // Run middleware with action without namespace
    return middleware(patchedStore)(patchedNext)(denamespacedAction(namespace)(action));
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
    actionProcessor(action, middleware, next, store)
  );
};
/**
 * Compose middlewares into one function
 * @param middlewares
 * @returns {function}
 */
const getComposedMiddleware = middlewares => (store) => compose(...middlewares.map(middleware => middleware(store)));
/**
 * Attach middlewares to store
 * @param middlewares
 * @returns {function(*=): function(*=): *}
 */
export default (...middlewares) => identifier => {
  const composedMiddleware = getComposedMiddleware(middlewares);
  const namespacedMiddleware = namespaced(identifier)(composedMiddleware);
  return store => {
    const storeNamespace = store.namespace;
    const namespacedIdentifier = storeNamespace ? `${storeNamespace}/${identifier}` : identifier;
    return attachMiddleware(namespacedMiddleware)(namespacedIdentifier)(store);
  }
};
