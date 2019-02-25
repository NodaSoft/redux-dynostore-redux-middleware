const hasNamespace = (action, namespace) => action && action.type && action.type.indexOf(`${namespace}/`) === 0;

export default hasNamespace
