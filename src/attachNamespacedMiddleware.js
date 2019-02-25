import isGlobal from './helpers/isGlobal';
import hasNamespace from './helpers/hasNamespace';
import attachMiddleware from './attachMiddleware';

const processAction = (namespace) => (action, callback) => {
  if (namespace && !isGlobal(action) && hasNamespace(action, namespace)) {
    return callback(action);
  }
};

const namespaced = (namespace) => {
  const actionProcessor = processAction(namespace);
  return (middleware) => (store) => (next) => (action) => (
    actionProcessor(action, (transformedAction) => middleware(store)(next)(transformedAction))
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
