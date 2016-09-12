# bur

A full stack framework to seed your React and GrahphQL projects.

### Intro

Bur combines next generation tools like React, GraphQL and Koa with an opinionated minimalist architecture. Bur tries to simplify building modern web apps in a couple ways...

1. One language to rule them all

[JS Logo]

It's ES2017 all the way down from view styling to database queries. Bur also encourages working with a minimal, pragmatically functional, feature set of Javascript to avoid common Javascript pitfalls like managing scope and inheritence.

2. Minimalistic architecture

[MVC picture]

Bur provides a base "MVC" architecture that scales complexity through modularity and flexiblity. Architectures using React and GraphQL these days can involve many layers and concepts such as "Resolvers", "Connectors", and "Schemas" on the GraphQL-side and "Actions", "Action Creators", "Reducers", "Stores", "React Routers", "React Views", on the React side. Bur tries to boil these layers down into a simpler separation of Model, View and Controller. That is not to say Bur is going backwards by eschewing newer ideas like unidirectional data flow for object-oriented data binding—instead Bur is taking liberty with the MVC definition to draw broader archictural lines around layers. Read more.

3. Eliminating boilerplate

[code showing generator commands]

Plugging together the many modules needed to get started with a basic app architecture using modern Javascript can be tiresome. Javascript fatigue is real, and Bur is here to help. Bur combines an opinionated set of tools using wrapper libraries like unikoa, joiql, and veact with a project generator command line tool to make it quick and easy to get set up.

### Getting Started

Bur stands on the shoulder's of giants. It would first be good to familiarize yourself with these tools.

* GraphQL
* React
* Baobab
* Koa
* Joi

Then you might want to understand some of the wrapper libraries that combine these into the Bur stack.

* Unikoa
* Universal Tree
* JoiQL
* JoiQL Mongo
* Veact

Gett started using the CLI

```
$ npm i -g bur
$ bur new myapp
$ cd myapp
$ npm install
```

Then create your first sub app, specifying model attributes.

```
$ bur app article title:string body:string
```

And start the application

```
$ npm start
```

### Architecture

Bur largely separates code into model, view and controller layers with supplementary concepts of routers, apps, and libraries. As your project grows it is encouraged to expand on this architecture by adding new layers or breaking out more apps (more on this below).

#### How it works

[UML diagram image]

Let's explain with two examples.

Server-side fetch and render

1. User lands on URL
2. Router delgates to controller
3. Controller send GraphQL query to model
4. Model retrieves data from Mongo and return through GraphQL
5. Controller updates state tree `state.set('article', data)`
6. View references updated state tree and renders to HTML string

Client-side modal opening

1. User clicks "open modal" button
2. Button click delegates to controller
3. Controller updates state tree `state.set('modalOpen', true)`
4. State tree re-renders view tree efficiently via React

#### Models

Models represent the data layer from GraphQL to the database. Bur combine's Joi, GraphQL, and MongoDB into a full data modeling solution called JoiQL Mongo. The basic idea is that you define your schema using Joi's API and hook into Koa-like middleware that persists at the bottom of the middleware stack.

```javascript
import { model, string } from 'joiql-mongo'

const user = model('user', {
  name: string(),
  email: string().email()
})

user.on('create', async (ctx, next) => {
  await next() // After successful document create
  const email = ctx.mutation.createUser.args.email
  sendConfirmationEmail(email)
})

export user
```

Models can then be combined and mounted into a Koa powered GraphQL server.

```javascript
import { graphqlize } from 'joiql-mongo'
import * as models from './models'

app.use(graphqlize(models))
```

Better understand models by reading about the tools they're made of...

* MongoDB
* Joi
* GraphQL
* JoiQL
* JoiQL Mongo

#### Views

Views are React components written in a more functional, vanilla Javascript, manner. Methods or event handlers you might typically add to a React component's class are extracted into controller functions—leaving the views to styling and rendering. This functional, vanilla JS, style of writing React components is wrapped up in a little library called Veact.

```javascript
import veact from 'veact'

const view = veact()
const { div } = view.els()

view.styles({
  header: {
    fontSize: 24
  }
})

view.render(() =>
  h1('.header', 'Hello World')
)
```

Using all Javascript has some advantages over other approaches such as combining a compile to language like JSX with a compile to CSS language like SASS, including...

* Less languages to learn
* The power of a fully featured programming language for your CSS and HTML
* Leverage vanilla JS syntax highlighters and linters for your views
* JS native code reuse patterns like `Object.assign` and `import` for CSS and HTML
* Simplified asset building
* Easily share variables between JS/CSS/HTML
* And more you have yet to be surprised by

Better understand views by reading about the tools they're made of...

* React
* Veact

#### Controllers

Controllers capture all the input handling logic and are simply a library of functions that operate on a state tree and are delegated to by views and routers. You can think of the controller state tree as one giant object that holds any data that could change over time. Everything from a boolean determining if a modal window is open or closed to the rich domain data of a model like fetched user data is fair game for the state tree. You may be thinking "Woh, one giant object holding all of your app's stateful data. That sounds insane an unmanageable". Well it turns out it's very reasonable and there's a lot of advantages to doing it this way. Thanks to Baobab you can also use [cursors], [monkies], and other architectural techniques [explained more below] to help manage a large state tree.

```javascript
import tree from 'universal-tree'

const state = tree({
  modalOpen: false,
  article: {}
})

export const toggleModal = () => {
  state.set('modalOpen', !state.get('modalOpen'))
}

export const articlePage = async (ctx) => {
  const { article } = await api('article { title }')
  state.set('article', article)
  ctx.render({ body: ArticlePage })
}
```

Better understand controllers by reading about the tools they're made of...

* Baobab
* Universal Tree
* Lokka

#### Routers

Routers are a universal routing API that declares url patterns and delgates to controller functions. Controller functions use a Koa 2 middleware API of `async (ctx, next) =>` that translates certain universal APIs like `ctx.url` or `ctx.redirect()` to work on the server and client. Any routing behavior that isn't universal should be composed outside of the router in the nearby client.js or server.js files.

```javascript
import unikoa from 'unikoa'
import { show } from './controllers'

const router = unikoa()

router.get('/article/:id', show)
```

Better understand routers by reading about the tools they're made of...

* Koa
* Unikoa
* Unikoa React Render
* Unikoa Bootstrap
* Page.js

#### App & Libraries

TODO: Needs work to be n00b friendly/generic

The app is the main unit of domain-specific modularity. One can separate code into layers like models, views, controllers, ui models, etc. within an app, but it is more encouraged to dileneate your large application into smaller apps. This, in conjunction with a root level shared components/lib folder, has proven to be a very successful architecture at Artsy with little need to add additional concepts at a project-wide level.

The app encapsulates a large unit of code that is specific and unique to your app's domain, as opposed to code that is generically useful across your company or the open source world. Examples of the former at Artsy would be a "markdown page" or "fair microsite" app, examples of the latter would be an "artsy auth modal", "fillwidth library" or "garner caching lib". Apps and libs also allow a wide level of freedom to choose the best architecture/approach for the job—an app can be a simple Koa app rendering a static page or a universal react app with all sorts of complexity. Similarly libs can be anything from an add function to a complex onboarding modal UI.

That said a good rule of thumb for choosing where to place code is first in an app. Then as one finds themself violating DRY and copy pasting code across apps, extract it into a lib that is designed in a more generically useful way. When doubling down on this concept, it sets this architecture up to be easier to extract whole apps into their own deployed projects. A lib should be designed in a way that it would be simple to extract into it's own repo and published to npm. An app should be designed in a manner that can run standalone with little, or no, extra code written. The process of extracting an app into it's own standalone project should ideally involve simply publishing the shared libs to npm, instead of source controlled with the project, moving the app folder into it's own repo, writing a package.json that looks like a subset of the parent project.

That said, a sort of "twelve factor" manifesto for writings apps/libs...

1. /lib folder is added to NODE_PATHs for ease of "promoting" a lib to npm
2. Apps and libraries never require backwards out of their /apps or /lib folders to avoid implicit dependencies that are hard to untangle
3. Apps export a single Koa instance that can be mounted and _just works_
4. Apps can be run standalone with a single `node apps/foo` command (bonus for using the `require.main === module` trick)
5. UI libs are self contained JS modules and don't need transpiling or hooking into any build process (can just be `require`d into any browserify build)
6. The exception to #4 and #5 is transpiling stage 4 ES features e.g. using `node -r babel-core/register apps/foo` or expecting the babelify transform

#### Blossoming Complexity

There are a number of strategies for dealing with complexity growing beyond the base MVC architecture Bur encourages. First of all a couple high-level philosophies we can suggest:

1. Solve big problems by breaking them down into smaller problems
2. There is no single tool for _every_ job—be quick to abbandon, or expand upon, patterns or libraries that aren't cutting it

With that said, ways to put this in practice can take numerous shapes...

Firstly if you find an app growing large in size and complexity, try splitting the app apart into smaller apps. For instance a single page for a user's profile could end up evolving into a full blown microsite with settings, photos, and blog pages. In this case it might make sense to separate that single user app into user-settings, user-photos, user-blog apps. A quick page refresh between app boundaries can do wonders for managing complexity and with Bur's universal appraoch to UI it could likely have little effect on the end user experience. Similarly it might make sense to refactor apps in a way that combines models into an API app and separates the views and controllers in to UI apps. Eventually you may even want to move some apps out into their own separarely deployed codebases.

If spliting an app with page refreshes is unacceptable, then it might make sense to introduce more layers beyond the base MVC. For instance if controller logic is getting to bloated you can introduce a UI model that extracts the state tree and the meat of controller functions into a UI model library. If the JoiQL Mongo model logic is getting too heavy it might make sense to break the functionality out into more single purpose libraries such as a "mailers" or "util".

Finally, the tools that Bur provides you are an attempt at something that is useful most of the time. If a particular UI or backend need is not a good fit for React, Mongo, GraphQL or any of the other tools provided—don't be shy about abandoning it all together. Bur's modular architecture should make it amiable to mount a new Koa app from scratch for a blank slate, or spin up an entirely different frontend or backend codebase that talks to the original Bur app.

### Why Yet Another Javscript Framework

GraphQL and React are revolutionary to how we build web apps. React has made building rich UIs that can optmize initial render time and SEO through universal Javascript much easier (not to mention what React Native does for mobile). In the same way that React has transformed frontend development, GraphQL is a signifcantly better solution for building backend APIs than REST—providing clients the convenience of querying a database while maintaining the separation benefits of using web services.

These technologies have caused a wonderful explosion of ideas, patterns, and ecosystem. So much so that it can be overwhelming to wrap one's head around it all—especially if you're building on top of a batteries included framework like Rails with it's own robust architecture. There are already various boilerplates and frameworks for getting started with React, and React-like, projects but they often leave out GraphQL or the backend story all-together.

Bur provides an end-to-end solution for building React + GraphQL apps with minimal layers, languages, and boilerplate involved.

### Bur?

A bur is a prickly seed case common in carrying the seeds of a tree. Turns out Bur projects are full of trees! You have your React component tree, your Baobab state tree, even GraphQL schemas are tree-like. So it felt appropriate that we name this framework after something that can begin your beautiful forest of apps. Also it's three letters, there's only two hard things in computer science, and npm is pretty booked these days.

## Contributing

Please fork the project and submit a pull request with tests. Install node modules `npm install` and run tests with `npm test`.

## License

MIT
