const REDUX_PREFIX = '@@redux/';

const isGlobal = (action) => !action.type || action.globalAction === true || action.type.startsWith(REDUX_PREFIX);

export default isGlobal
