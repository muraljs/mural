//
// Given a name for a project, this scaffolds the initial directory with
// and empty /apps folder. After using it'll prompt to...
//
// $ cd myapp
// $ npm install
//
// $ mural app article title:string body:string
//
// Project structure looks like
// /apps
// /lib
// .env
// package.json
// index.js
//
const fs = require('fs')
const path = require('path')
const dedent = require('dedent')

module.exports = (dirname) => {
  const projectName = path.basename(dirname)
  const dir = path.resolve(process.cwd(), dirname)
  const globalRequires = '-r dotenv/config -r babel-core/register'

  const index = dedent`
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

  const pkgjson = dedent`
    {
      "name": "${projectName}",
      "version": "0.0.1",
      "private": true,
      "scripts": {
        "node": "NODE_PATH=$NODE_PATH:./lib node ${globalRequires}",
        "start": "concurrently 'npm run node .' 'mongod'"
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
        "concurrently": "^2.1.0",
        "dotenv": "^2.0.0",
        "envify": "^3.4.0",
        "graphql": "^0.7.0",
        "hotglue": "0.0.2",
        "joiql-mongo": "^1.0.7",
        "koa": "^2.0.0-alpha.4",
        "lokka": "^1.7.0",
        "lokka-transport-http": "^1.4.0",
        "react": "^15.3.1",
        "react-dom": "^15.3.1",
        "unikoa": "0.0.1",
        "unikoa-bootstrap": "0.0.2",
        "unikoa-react-render": "0.0.3",
        "universal-tree": "0.0.2",
        "veact": "0.0.5"
      }
    }
  `.trim() + '\n'

  fs.mkdirSync(dir)
  fs.mkdirSync(dir + '/apps')
  fs.mkdirSync(dir + '/lib')
  fs.writeFileSync(dir + '/package.json', pkgjson)
  fs.writeFileSync(dir + '/.env', env)
  fs.writeFileSync(dir + '/index.js', index)

  console.log(dedent`
    install dependencies:
      $ cd ${path.relative(process.cwd(), dir)} && npm install

    generate a sub-app:
      $ mural app article title:string body:string

    start the server and database:
      $ npm start
  `)
}
