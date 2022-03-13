
'use strict'
// Sample
class Player {
  constructor (name) {
    // invokes the setter
    this.name = name
  }

  get name () {
    return this._name
  }

  set name (value) {
    if (value.length < 4) {
      alert('Name is too short.')
      return
    }
    this._name = value
  }
}

//   let user = new User("John");
//   alert(user.name); // John

//   user = new User(""); // Name is too short.
