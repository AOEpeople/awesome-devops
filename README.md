# Awesome DevOps

An Awesome List of DevOps tools and topics curated by AOE GmbH.

:point_right: https://d2vnfobepp3kui.cloudfront.net :point_left:

## How to add

All the links are maintained in [awesome-list.yml](./awesome-list.yml). Throw any link at it, and this project
will try to make it informative using [OpenGraph](https://ogp.me) and the [Github API](https://docs.github.com/en/rest).

### Example

````yml
categories:
  - name: Hello World
    description: This is an example category
    items:
    - github: lensapp/lens
    - name: Dive - An awesome tool
      description: You can override the default description.
      github: wagoodman/dive
    - uri: https://servicemesh.es
      description: Links to websites and articles also work
````

## Development

This project uses yarn, React and MaterialUI.

Run

````bash
yarn install

# generate src/awesome-list-compiled.json (this is the enriched versoin of awesome-list.yml)
yarn build-json

yarn start
````

Open [http://localhost:3000](http://localhost:3000) to view the application in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.
