import { applyMiddleware, legacy_createStore as createStore , compose, combineReducers} from "redux";
import thunk from 'redux-thunk';
import  loginReducer  from './Layout/reducer';
import  sidbarReducer  from './sideBar/reducer';

const composeEnhancers =
  typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?   
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
       
    }) : compose;

const middleware = [thunk];

const enhancer = composeEnhancers(
  applyMiddleware(...middleware),
  
   
);

const rootReducer = combineReducers({
   loginInfo: loginReducer,
   sidbarReducer,
 
});

export const store = createStore(rootReducer, enhancer);