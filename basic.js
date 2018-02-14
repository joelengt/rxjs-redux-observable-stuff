
/** > Basic event */

// normal event
var button = document.querySelector('button');
button.addEventListener('click', () => console.log('Clicked!'));

// With RxJS:
Rx.Observable.fromEvent(button, 'click')
   .subscribe(() => console.log('Clicked!'));

/**
 * Purity
 */

// normal
var count = 0;
var button = document.querySelector('button');
button.addEventListener('click', () => console.log(`Clicked ${++count} times`));

// Using RxJS you isolate the state.

var button = document.querySelector('button');
Rx.Observable.fromEvent(button, 'click')
  .scan(count => count + 1, 0) // (event function , initial value)
  .subscribe(count => console.log(`Clicked ${count} times`));

// * scan operator works just like reduce for arrars


/** 
 * FLow
*/

//  how you would allow at most one click per second, with plain JavaScript

// normal
var count = 0;
var rate = 1000;
var lastClick = Date.now() - rate;
var button = document.querySelector('button');
button.addEventListener('click', () => {
  if (Date.now() - lastClick >= rate) {
    console.log(`Clicked ${++count} times`);
    lastClick = Date.now();
  }
});

// With RxJS:
var button = document.querySelector('button');
Rx.Observable.fromEvent(button, 'click')
  .throttleTime(1000)
  .scan(count => count + 1, 0)
  .subscribe(count => console.log(`Clicked ${count} times`));


// array
console.log('REsult =>', Rx.Observable.of(1,2,3))


// filter
const boxes = $('.f')
Rx.Observable.fromEvent(boxes, 'click')
  .filter(ev => ev.target.value === '6' )
  .subscribe(x => console.log(x))


// Creating a function 
var foo = Rx.Observable.create((observer) => {
  console.log('Hello');
  observer.next(42);
  observer.next(100);
  observer.next(200);
  setTimeout(() => {
    observer.next(300); // happens asynchronously
  }, 1000);

  observer.complete();
  observer.next(4); // Is not delivered because it would violate the contract

});

console.log('before');

foo.subscribe((x) => {
  console.log(x);
});

console.log('after');


// try/catch -> way to create and be a obserber as next, complete, error

var observable = Rx.Observable.create(function subscribe(observer) {
  try {
    observer.next(1);
    observer.next(2);
    observer.next(3);
    observer.complete();
  } catch (err) {
    observer.error(err); // delivers an error if it caught one
  }
});


// a complete or error will block string way


var subscription = observable.subscribe(x => console.log(x));


var observable = Rx.Observable.from([10, 20, 30]);
var subscription = observable.subscribe(x => console.log(x));
// Later:
subscription.unsubscribe();


// observable - subscribe -> 
var observer = {
  next: x => console.log('Observer got a next value: ' + x),
  error: err => console.error('Observer got an error: ' + err),
  complete: () => console.log('Observer got a complete notification'),
};

observable.subscribe(observer);

// Observers are just objects with three callbacks, one for each type of notification that an Observable may deliver.


// next is default
var subscription = observable.subscribe(x => console.log(x));

/** SAMPLES */

// Event input 

// typing "hello world"
var $input = document.querySelector('input')
var input = Rx.Observable.fromEvent($input, 'input');

// Pass on a new value
input.map(event => event.target.value)
  .subscribe(value => console.log(value)); // "h"

// Pass on a new value by plucking it
input.pluck('target', 'value')
  .subscribe(value => console.log(value)); // "h"

// Pass the two previous values
input.pluck('target', 'value').pairwise()
  .subscribe(value => console.log(value)); // ["h", "e"]

// Only pass unique values through
input.pluck('target', 'value').distinct()
  .subscribe(value => console.log(value)); // "helo wrd"

// Do not pass repeating values through
input.pluck('target', 'value').distinctUntilChanged()
  .subscribe(value => console.log(value)); // "helo world"


// Event button

var button = document.querySelector('button');
Rx.Observable.fromEvent(button, 'click')
  // scan (reduce) to a stream of counts
  .scan(count => count + 1, 0)
  // Set the count on an element each time it changes
  .subscribe(count => document.querySelector('#count').innerHTML = count);




// state store
var increaseButton = document.querySelector('#increase');
var increase = Rx.Observable.fromEvent(increaseButton, 'click')
  // We map to a function that will change our state
  .map(() => state => Object.assign({}, state, {count: state.count + 1}));


// Inmutable JS
import Immutable from 'immutable';
import someObservable from './someObservable';
import someOtherObservable from './someOtherObservable';

var initialState = {
  foo: 'bar'
};

var state = Observable.merge(
  someObservable,
  someOtherObservable
).scan((state, changeFn) => changeFn(state), Immutable.fromJS(initialState));

export default state;

// -- importing the above stuff

import state from './state';

state.subscribe(state => {
  document.querySelector('#text').innerHTML = state.get('foo');
});


// REACT

import messages from './someObservable';

class MyComponent extends ObservableComponent {
  constructor(props) {
    super(props);
    this.state = {messages: []};
  }
  componentDidMount() {
    this.messages = messages
      // Accumulate our messages in an array
      .scan((messages, message) => [message].concat(messages), [])
      // And render whenever we get a new message
      .subscribe(messages => this.setState({messages: messages}));
  }
  componentWillUnmount() {
    this.messages.unsubscribe();
  }
  render() {
    return (
      <div>
        <ul>
          {this.state.messages.map(message => <li>{message.text}</li>)}
        </ul>
      </div>
    );
  }
}

export default MyComponent;