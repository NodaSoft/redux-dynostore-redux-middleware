import isGlobal from './helpers/isGlobal';
import hasNamespace from './helpers/hasNamespace';
import attachMiddleware from './attachMiddleware';

const processAction = (namespace) => (action, callback, fallback) => {
  if (namespace && !isGlobal(action) && hasNamespace(action, namespace)) {
    return callback({...action, type: action.type.substring(namespace.length + 1)});
  }
  return fallback(action)
};

const namespaced = (namespace) => {
  const actionProcessor = processAction(namespace);
  return (middleware) => (store) => (next) => (action) => (
    actionProcessor(action, (action) => middleware(store)(next)(action), (action) => next(action))
  );
};


export default (middleware) => identifier => {
  const namespacedMiddleware = namespaced(identifier)(middleware);
  return store => {
    const storeNamespace = store.namespace;
    const namespacedIdentifier = storeNamespace ? `${storeNamespace}/${identifier}` : identifier;
    const middlewareToAttach = storeNamespace ? namespaced(storeNamespace)(namespacedMiddleware) : namespacedMiddleware;
    return attachMiddleware(middlewareToAttach(store))(namespacedIdentifier)(store);
  }
};
