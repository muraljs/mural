//
// Given an app name and attributes, this will scaffold a bare MVC sup app
//
// $ gluu app article title:string body:string
//
const { values, map, fromPairs, keys, uniq } = require('lodash')
const program = require('commander')
const path = require('path')
const fs = require('fs')

program
  .version('0.0.1')
  .usage('name <attrs ...>')
  .parse(process.argv)

const pkg = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'package.json'))
)
const name = program.args[0]
const dir = path.resolve(process.cwd(), `apps/${name}`)
const attrs = fromPairs(program.args.slice(1).map((s) => s.split(':')))
const schema = map(attrs, (type, name) =>
  `${name}: ${type}()`
).join(',\n  ')

// Controller file code
const controller = `
import Lokka from 'lokka'
import Transport from 'lokka-transport-http'
import tree from 'universal-tree'
import Index from '../views'

const api = new Lokka({
  transport: new Transport(process.env.APP_URL + '/api/${name}')
})

export const state = tree({
  ${name}: {}
})

export const index = async (ctx) => {
  const { ${name} } = await ctx.bootstrap(() =>
    api.query('{ ${name} { ${keys(attrs).join(' ')} } }')
  )
  state.set('${name}', ${name})
  ctx.render({ body: Index })
}
`.trim() + '\n'

// Model file code
const model = `
import { model, ${uniq(values(attrs)).join(', ')} } from 'joiql-mongo'

export default model('${name}', {
  ${schema}
})
`.trim() + '\n'

// View file code
const view = `
import veact from 'veact'
import { state } from '../controllers'

const view = veact()

const { div } = view.els()

view.render(() =>
  div(
    ${keys(attrs).map((attr) =>
      `div(state.get('${name}').${attr})`
    ).join(',\n    ')})
)

export default view()
`.trim() + '\n'

const head = `
import veact from 'veact'

const reset = \`
html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed,
figure, figcaption, footer, header, hgroup,
menu, nav, output, ruby, section, summary,
time, mark, audio, video {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
}
/* HTML5 display-role reset for older browsers */
article, aside, details, figcaption, figure,
footer, header, hgroup, menu, nav, section {
  display: block;
}
body {
  line-height: 1;
}
ol, ul {
  list-style: none;
}
blockquote, q {
  quotes: none;
}
blockquote:before, blockquote:after,
q:before, q:after {
  content: '';
  content: none;
}
table {
  border-collapse: collapse;
  border-spacing: 0;
}
* {
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}\`
const view = veact()
const { style } = view.els()

view.render(() => style({ dangerouslySetInnerHTML: { __html: reset } }))

export default view()
`.trim() + '\n'

// Client file code
const client = `
import router from './router'

router.routes()
`.trim() + '\n'

// Server file code
const server = `
import Koa from 'koa'
import { graphqlize } from 'joiql-mongo'
import router from './router'
import * as models from './models'

const app = new Koa()

router.all('/api/${name}', graphqlize(models))
app.use(router.routes())

export default app
`.trim() + '\n'

// Router file code
const router = `
import unikoa from 'unikoa'
import bootstrap from 'unikoa-bootstrap'
import render from 'unikoa-react-render'
import { index, state } from './controllers'
import Head from './views/head'

const router = unikoa()

router.use(bootstrap)
router.use(render({
  head: Head,
  subscribe: (cb) => state.on('update', cb)
}))
router.get('/${name}/:id', index)

export default router
`.trim() + '\n'

// Index file code
const index = `
const { connect } = require('joiql-mongo')
const hotglue = require('hotglue')
const babelify = require('babelify')
const envify = require('envify')

const app = module.exports = hotglue({
  relative: __dirname,
  server: {
    main: 'server.js',
    watch: [
      'views/**/*',
      'controllers/**/*',
      'models/**/*',
      'router.js',
      'server.js'
    ]
  },
  client: {
    main: 'client.js',
    transforms: [babelify, envify],
    watch: [
      'views/**/*',
      'controllers/**/*',
      'router.js',
      'client.js'
    ]
  }
})

if (require.main === module) {
  connect('mongodb://localhost:27017/${pkg.name}')
  app.listen(process.env.PORT)
  console.log('Listening on ' + process.env.PORT)
}
`.trim() + '\n'

fs.mkdirSync(dir)
fs.mkdirSync(dir + '/controllers')
fs.mkdirSync(dir + '/models')
fs.mkdirSync(dir + '/views')
fs.writeFileSync(dir + '/controllers/index.js', controller)
fs.writeFileSync(dir + '/models/index.js', model)
fs.writeFileSync(dir + '/views/index.js', view)
fs.writeFileSync(dir + '/views/head.js', head)
fs.writeFileSync(dir + '/client.js', client)
fs.writeFileSync(dir + '/server.js', server)
fs.writeFileSync(dir + '/router.js', router)
fs.writeFileSync(dir + '/index.js', index)

console.log(`
  Done. Mount sup app in the index.js file:
    \`\`\`
    import ${name} from './apps/${name}'

    // ...

    // Mount apps
    app.use(...${name}.middleware)
    \`\`\`
`)
