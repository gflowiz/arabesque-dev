# deepobj(action, obj, path)

Get, set, delete or do what you want with a deep object (it keeps the object reference).
inspired from [dlv](https://github.com/developit/dlv) and [dset](https://github.com/lukeed/dset/)

# Install:
```npm i @ranfdev/deepobj```

## Examples:

```
import deepobj from "@ranfdev/deepobj"
const objectToTest = {a: {b: {c: {d: 2}}}}


// define some basic actions

const get = (obj, prop) => obj[prop];
const set = n => (obj, prop) => (obj[prop] = n);

// You can do what you want, even deleting the nested object
const del = (obj, prop) => delete obj[prop];

// use them
deepobj(get, objectToTest, 'a.b.c.d') // 2
deepobj(set(10), objectToTest, 'e.f.g')

console.log(objectToTest.e.f.g) //10
```

## Why i made this

dlv only returns the value of the nested object. I needed a way to get the reference of the nested object
