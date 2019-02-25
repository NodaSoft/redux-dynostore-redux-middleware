/**
 * Create global middleware to get access to attached dynamic middlewares
 * @returns {function(*=): *}
 */
export default () => (store) => (next) => (action) => store.dynamicMiddlewaresEnhancer(store)(next)(action);
