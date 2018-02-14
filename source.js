// currying promise
function myPromise() {
    return new Promise((reject, resolve) => {
      const element = () => app.apply(this, [12,3,4,5])
      resolve(element(this))
    })
  }
  
  // short way promise
  const customPromise = new Promise((reject, resolve) => {
    setTimeout(() => {
      resolve('solved!')
    }, 1000)
  })
  
  
  // read promise with observables
  const obsvPromise = Rx.Observable.fromPromise(customPromise)
  obsvPromise.suscribe(result => print(result))
  
  
  
  
  // Interval
  const interval = Rx.Observable.interval(1000)
  interval.subscribe(int => print(new Date().getSeconds() ))
  
  
  // Any data type
  
  const mashup = Rx.Observable.of('anything', ['sample', 'hello'], 23, true, {cool: 'stuff'})
  mashup.subscribe(val => print(val))
  
  
  /** hot vs cold */
  
  // Observable cold -> when your return a diferent data, that mean the date is building inside
  const cold = Rx.Observable.create(observer => {
    observer.next( Math.random() )
  })
  
  cold.subscribe(a => print(`Subscriber A: ${a}`))
  cold.subscribe(b => print(`Subscriber B: ${b}`))
  // you get differente data
  
  
  // Basic hot Observable
  const x =  Math.random()
  const cold = Rx.Observable.create(observer => {
    observer.next(x)
  })
  
  cold.subscribe(a => print(`Subscriber A: ${a}`))
  cold.subscribe(b => print(`Subscriber B: ${b}`))
  // you get the same data
  
  
  // Hot observable
  const cold = Rx.Observable.create(observer => {
    observer.next( Math.random() )
  })
  
  const hot = cold.publish()
  
  hot.subscribe(a => print(`Subscriber A: ${a}`))
  hot.subscribe(b => print(`Subcriber B: ${b}`))
  hot.connect()
  // you get the same data
  
  
  /** interval with a finish */
  
  const interval = Rx.Observable.interval(500)
    .finally(() => print('All done!'))
  
  const subscription = interval.subscribe(x => print(x))
  
  setTimeout(() => {
    subscription.unsubscribe()
  }, 3000)
  
  
  /** Maps */
  const jsonString = '{ "type": "Dog", "breed": "Pug" }'
  const apiCall = Rx.Observable.of(jsonString)
  
  apiCall
    .map(json => JSON.parse(json))
    .subscribe(obj => {
      print(obj.type)
      print(obj.breed)
    })
  
  
  /** DO */
  const names = Rx.Observable.of('Simon', 'Garfunke')
  
  names
    .do(name => print(name))
    .map(name => name.toUpperCase())
    .do(name => print(name))
    .subscribe()
  
  
  
  /** filter */
  const numbers = Rx.Observable.of(1, 4, 2, -9, 4, 15) 
  numbers
    .filter(n => n >= 0)
    .subscribe(n => print(n))
  
  
  const numbers = Rx.Observable.of(1, 4, 2, -9, 4, 15) 
  numbers
    .first()
    // .last()  
    .subscribe(n => print(n))
  
  
  
  
  /**
   * Events and ThrottleTIme and debounceTime
   */
  
  // throttleTime
  let mouseEvents = Rx.Observable.fromEvent(document, 'mousemove')
  
  mouseEvents
    .throttleTime(1000) // exec each 1000
    //.debounceTime(1000) // exec after the last event
    .subscribe(e => print(e.type))
  
  
  
  /** scan */
  // It's like as a array reducer in vanillajs
  
  let clicks = Rx.Observable.fromEvent(document, 'click')
  
  clicks
    .map(e => parseInt(Math.random() * 10))
    .do(score => print(`Click scored ${score}`))
    .scan((highScore, score) => highScore + score)
    .subscribe(highScore => print(`Current highScore ${highScore}`))
  
  
  /** switch Map */
  let clicks = Rx.Observable.fromEvent(document, 'click')
  
  clicks.switchMap(click => {
    return Rx.Observable.interval(500)
  })
  .subscribe(i => print(i))
  
  
  /** Zip - a way to merge obserbables */
  
  const yin = Rx.Observable.of('peanut', 'butter', 'wine', 'rainbows')
  const yang = Rx.Observable.of('jelly', 'cheese', 'unicorns')
  
  const combo = Rx.Observable.zip(yin, yang)
  combo.subscribe(arr => print(arr))
  
  
  
  /** Catch errors */
  const obserbables = Rx.obserbables.create( observer => {
    observer.next('good')
    observer.next('great')
    observer.next('grand')
  
    throw 'catch me!'
  
    observer.next('a wonder solution!')
  })
  
  Observable
    .catch(err => print(`Error caught: ${err}`))
    // .retry(2)
    .subscribe(val => print(val))
  
  
  
  /** Subject */
  
  // It's just A Observable but with a few bonus features
  
  const subject = Rx.Subject.of('hello')
  
  const subA = subject.subscribe(val => print(`Sub A: ${a}`))
  const subB = subject.subscribe(val => print(`Sub B: ${b}`))
  
  
  
  // benefist subject
  const subject = Rx.Subject()
  
  const subA = subject.subscribe(val => print(`Sub A: ${a}`))
  const subB = subject.subscribe(val => print(`Sub B: ${b}`))
  
  subject.next('hello')
  
  setTimeout(() => {
    subject.next('world')
  }, 1000)
  
  // the main benefist feature is that you are able to broadcast new value to the subscriber with new data
  
  
  
  // multicast
  const observable = Rx.Observable.fromEvent(document, 'click')
  
  const cliks = observable
                .do(() => print('Do ONe TIme!'))
  
  const subject = clicks.multicast(() => new Rx.Subject());
  
  const subA = subject.subscribe(c => print(`Sub A: ${c.timeStamp}`))
  const subB = subject.subscribe(c => print(`Sub B: ${c.timeStamp}`))
  
  subject.connect();
  
  
  /** create  */
  var observer = {
    next: function (value) {
      console.log(value)
    },
    error: function (error) {
      console.log(error)
    },
    complete: function () {
      console.log('complete!')
    }
  }
  
  Rx.Observable.create(function(obs) {
    obs.next('A value!')
    obs.next('B value!')
    //obs.error('A value crash!')
    setTimeout(function() {
      obs.complete()    
    })
    obs.next('D value!')
    obs.next('C value!')
  })
    .subscribe(observer)
  
  
  // SAMPLES => https://www.youtube.com/watch?v=2LCo926NFLI



// Sample

const someOrder = {
    items: [
        { name: 'Dragon food', price: 98, quantity: 3},
        { name: 'Dragon age', price: 982, quantity: 33},
        { name: 'Dragon food 3', price: 8, quantity: 2},
    ]
}


const orderTOtal = order => {
    const totalItems = order.items
        .filter(x => !x.shipping)
        .reduce((prev, cur) => prev + (cur.proce * cur.quantity), 0)
    const shippingItem = order.items.find(x => !!x.shipping)
    const shipping = totalItems > 1000 ? 0 : shippingItem.price
    return totalItems + shipping
}

result = orderTOtal(someOrder)
result = 940


// sample array
function getArray() {
    return ['ss', 'dasdd', 'wee', 'dddsd']
}

getArray().reduce((acc, item) => acc + item, 0)

// array
Array.from('sample from the begining')
