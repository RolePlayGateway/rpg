# `@rpg/core`
simple Fabric-hosted RPG

## Quick Start
`npm install && npm start`

## Developers
```
mkdir ~/workspace && cd ~/workspace # create workspace (if not exist) and cd

# fork & clone each repo for contributions you might make
git clone git@github.com:YOUR_USERNAME/rpg.git
git clone git@github.com:YOUR_USERNAME/http.git
git clone git@github.com:YOUR_USERNAME/fabric.git

# configure symlinks for each independent repository
cd fabric && git checkout rpg-0.2.0-develop && yarn link
cd ../http && git checkout fabric-0.1.0 && yarn link && yarn link @fabric/core
cd ../rpg && git checkout rpg-0.2.0-develop && yarn link @fabric/core && yarn link @fabric/http

# install & start
yarn install
yarn start

# enable use of development version for target...
yarn link @fabric/core
yarn link @fabric/http

# Restart the main process and check dependencies.
# Good luck, have fun!
#                                              ~ E
```

Remember to run `yarn build:ui` at least once for local environments.

### API
See output of `npm run docs` for an HTTP-serving URL with well-organized
documentation.  All source code is included, so feel free to submit proposals
for potential changes.
