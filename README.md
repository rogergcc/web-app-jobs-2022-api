# web-app-jobs-2022-api
BACKEND - API
THESIS - WebApp Busqueda DE OFERTAS LABORALES usando tecnicas webscraping de portales de trabajo.

-indeed
-linkedin
-getonboard

# Technologies used.
Nodejs, body-parser, dotenv, express, rss-parser, puppeter

# Getting Started
1. Clone repo and install npm nodejs git.
2. npm i
3. Run script:

```
  npm run dev 
  
  /api/v1/jobs
  /api/v1/getJobs

```
.env
```
  HOST=http://localhost
  PORT=3000
```


# Entorno Local
Buscar trabajo de portales Indeed,Linkedin y GetOnboard

Ejemplos
GET http://localhost:3001/api/v1/getJobs?trabajo=android
GET http://localhost:3001/api/v1/getJobs?trabajo=react
GET http://localhost:3001/api/v1/getJobs?trabajo=angular



