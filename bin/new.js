//
// Given a name for a project, this scaffolds the initial directory with
// and empty /apps folder. After using it'll prompt to...
//
// $ cd myapp
// $ npm install
//
// $ gluu app article title:string body:string
//
// Project structure looks like
// /apps
// /lib
// .env
// package.json
// index.js
//
const program = require('commander')
const fs = require('fs')
const path = require('path')

program
  .version('0.0.1')
  .usage('name')
  .parse(process.argv)

const projectName = path.basename(program.args[0])
const dir = path.resolve(process.cwd(), program.args[0])
const globalRequires = '-r dotenv/config -r babel-core/register'

const index = `
import { connect } from 'joiql-mongo'
import Koa from 'koa'
// import article from './apps/article'

const app = new Koa()
const { PORT, MONGO_URL } = process.env

// Mount apps
// app.use(...article.middleware)

// Connect to Mongo and start server
connect(MONGO_URL)
app.listen(PORT)
console.log('Listening on ' + PORT)
`.trim() + '\n'

const env = `
NODE_ENV=development
APP_URL=http://localhost:3000
PORT=3000
MONGO_URL=mongodb://localhost:27017/${projectName}
`.trim() + '\n'

const pkgjson = `
{
  "name": "${projectName}",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "node": "NODE_PATH=$NODE_PATH:./lib node ${globalRequires}",
    "start": "concurrently 'npm run node .' 'mongod'"
  },
  "standard": {
    "parser": "babel-eslint"
  },
  "babel": {
    "presets": [
      "es2015",
      "stage-3"
    ],
    "plugins": [
      "transform-runtime"
    ]
  },
  "dependencies": {
    "babel": "^6.5.2",
    "babel-core": "^6.13.0",
    "babel-plugin-transform-runtime": "^6.12.0",
    "babel-preset-es2015": "^6.13.0",
    "babel-preset-stage-3": "^6.11.0",
    "babelify": "^7.3.0",
    "graphql": "^0.7.0",
    "koa": "^2.0.0-alpha.4",
    "lokka": "^1.7.0",
    "lokka-transport-http": "^1.4.0",
    "promised-mongo": "^1.2.0",
    "unikoa": "0.0.1",
    "unikoa-bootstrap": "0.0.2",
    "unikoa-react-render": "0.0.3",
    "universal-tree": "0.0.1",
    "veact": "0.0.5",
    "hotglue": "0.0.2",
    "dotenv": "^2.0.0",
    "concurrently": "^2.1.0",
    "envify": "^3.4.0",
    "joiql-mongo": "^1.0.7"
  }
}
`.trim() + '\n'

fs.mkdirSync(dir)
fs.mkdirSync(dir + '/apps')
fs.mkdirSync(dir + '/lib')
fs.writeFileSync(dir + '/package.json', pkgjson)
fs.writeFileSync(dir + '/.env', env)
fs.writeFileSync(dir + '/index.js', index)

console.log(`
 install dependencies:
   $ cd ${dir} && npm install

 generate a sub app:
   $ gluu app article title:string body:string
`)
