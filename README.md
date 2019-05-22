# To run:

## w/ frontend watch
run api doc
```
npm install
npm start

go to http://localhost:8080/
```

## w/ frontend and backend watch
Note: nodemon and webpack are not optimal to have watching at the same time. Nodemon refreshing the server can sometimes lead to the frontend part taking a while to refresh.

install nodemon:
```
npm install -g nodemon
```
run api doc
```
npm install
npm run-script startnodemon

go to http://localhost:8080/
```