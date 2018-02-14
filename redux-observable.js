
const PING = 'PING';
const PONG = 'PONG';

const ping = () => ({ type: PING });

const pingEpic = action$ =>
  action$.ofType(PING) // Need to match against multiple action types? action$.ofType(FIRST, SECOND, THIRD) // FIRST or SECOND or THIRD
    .delay(1000) // Asynchronously wait 1000ms then continue
    .mapTo({ type: PONG });


const pingEpic2 = action$ =>
  action$.filter(action => action.type === 'PING')
    .mapTo({ type: 'PONG' });


const pingEpic3 = action$ =>
  action$.filter(action => action.type === 'PING')
    .delay(1000) // Asynchronously wait 1000ms then continue
    .mapTo({ type: 'PONG' });
    
// later...
// dispatch({ type: 'PING' });

const pingReducer = (state = { isPinging: false }, action) => {
  switch (action.type) {
    case PING:
      return { isPinging: true };

    case PONG:
      return { isPinging: false };

    default:
      return state;
  }
};

// components/App.js

const { connect } = ReactRedux;

let App = ({ isPinging, ping }) => (
  <div>
    <h1>is pinging: {isPinging.toString()}</h1>
    <button onClick={ping}>Start PING</button>
  </div>
);

App = connect(
  ({ isPinging }) => ({ isPinging }),
  { ping }
)(App);

// redux/configureStore.js

const { Provider } = ReactRedux;
const { createStore, applyMiddleware } = Redux;
const { createEpicMiddleware } = ReduxObservable;

const epicMiddleware = createEpicMiddleware(pingEpic);

const store = createStore(pingReducer,
  applyMiddleware(epicMiddleware)
);

// index.js

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);



/** sample 2 */
import { ofType } from 'redux-observable';
import { delay, mapTo } from 'rxjs/operators'; // rxjs v5.5+

const pingEpic = action$ =>
  action$.pipe(
    ofType('PING'),
    delay(1000), // Asynchronously wait 1000ms then continue
    mapTo({ type: 'PONG' })
  );



/** A Real World Example */

import { ajax } from 'rxjs/observable/dom/ajax';

// action creators
const fetchUser = username => ({ type: FETCH_USER, payload: username });
const fetchUserFulfilled = payload => ({ type: FETCH_USER_FULFILLED, payload });

// epic
const fetchUserEpic = action$ =>
  action$.ofType(FETCH_USER)
    .mergeMap(action =>
      ajax.getJSON(`https://api.github.com/users/${action.payload}`)
        .map(response => fetchUserFulfilled(response))
    );

// later...
dispatch(fetchUser('torvalds'));



/**
 * Accessing the Store's State
 */

const INCREMENT = 'INCREMENT';
const INCREMENT_IF_ODD = 'INCREMENT_IF_ODD';

const increment = () => ({ type: INCREMENT });
const incrementIfOdd = () => ({ type: INCREMENT_IF_ODD });

const incrementIfOddEpic = (action$, store) =>
  action$.ofType(INCREMENT_IF_ODD)
    .filter(() => store.getState().counter % 2 === 1)
    .map(() => increment());

// later...
dispatch(incrementIfOdd());



/** Combining Epics */

import { combineEpics } from 'redux-observable';

const rootEpic = combineEpics(
  pingEpic,
  fetchUserEpic
);

import { merge } from 'rxjs/observable/merge';

const rootEpic = (action$, store) => merge(
  pingEpic(action$, store),
  fetchUserEpic(action$, store)
);





/** Cancellation Event */
const { Observable } = Rx;

const FETCH_USER = 'FETCH_USER';
const FETCH_USER_FULFILLED = 'FETCH_USER_FULFILLED';
const FETCH_USER_REJECTED = 'FETCH_USER_REJECTED';
const FETCH_USER_CANCELLED = 'FETCH_USER_CANCELLED';

const fetchUser = id => ({ type: FETCH_USER, payload: id });
const fetchUserFulfilled = payload => ({ type: FETCH_USER_FULFILLED, payload });
const cancelFetchUser = () => ({ type: FETCH_USER_CANCELLED });

const fakeAjax = url =>
  Observable.of({
    id: url.substring(url.lastIndexOf('/') + 1),
    firstName: 'Bilbo',
    lastName: 'Baggins'
  }).delay(1000);

const fetchUserEpic = action$ =>
  action$.ofType(FETCH_USER)
    .mergeMap(action =>
      fakeAjax(`/api/users/${action.payload}`)
        .map(response => fetchUserFulfilled(response))
        .takeUntil(action$.ofType(FETCH_USER_CANCELLED))
    );

const users = (state = {}, action) => {
  switch (action.type) {
    case FETCH_USER:
        return {};

    case FETCH_USER_FULFILLED:
      return {
        ...state,
        [action.payload.id]: action.payload
      };

    default:
      return state;
  }
};

const isFetchingUser = (state = false, action) => {
  switch (action.type) {
    case FETCH_USER:
      return true;

    case FETCH_USER_FULFILLED:
    case FETCH_USER_CANCELLED:
      return false;

    default:
      return state;
  }
};



/** Error Handling */

const ajaxShouldError = true;
/***************************************************************/

const { Observable } = Rx;

const FETCH_USER = 'FETCH_USER';
const FETCH_USER_FULFILLED = 'FETCH_USER_FULFILLED';
const FETCH_USER_REJECTED = 'FETCH_USER_REJECTED';

const fetchUser = id => ({ type: FETCH_USER, payload: id });
const fetchUserFulfilled = payload => ({ type: FETCH_USER_FULFILLED, payload });
const fetchUserRejected = payload => ({ type: FETCH_USER_REJECTED, payload, error: true });

const fetchUserEpic = action$ =>
  action$.ofType(FETCH_USER)
    .mergeMap(action =>
      fakeAjax(`/api/users/${action.payload}`)
        .map(response => fetchUserFulfilled(response))
        .catch(error => Observable.of(
          fetchUserRejected(error.xhr.response)
        ))
    );

const users = (state = {}, action) => {
  switch (action.type) {
    case FETCH_USER:
        return {};

    case FETCH_USER_FULFILLED:
      return {
        ...state,
        [action.payload.id]: action.payload
      };

    default:
      return state;
  }
};

const fetchUserError = (state = null, action) => {
  switch (action.type) {
    case FETCH_USER:
    case FETCH_USER_FULFILLED:
      return null;

    case FETCH_USER_REJECTED:
      return action.payload;

    default:
      return state;
  }
};

// Fake AJAX stuff for the demo

let callCount = -1;
const fakeAjax = url => {
  callCount++;

  if (ajaxShouldError && callCount % 2 === 0) {
    return Observable.throw({
      xhr: {
        response: {
          message: 'AJAX CALL ERRORED!'
        }
      }
    }).materialize().delay(1000).dematerialize();
  } else {
    return Observable.of({
      id: url.substring(url.lastIndexOf('/') + 1),
      firstName: 'Bilbo',
      lastName: 'Baggins'
    }).delay(1000);    
  }
};
