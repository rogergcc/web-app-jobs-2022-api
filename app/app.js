const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const cors = require("cors");

const Parser = require("rss-parser");
const axios = require("axios");

const App = express();

App.use(express.static(path.join(__dirname, "../public")));
// App.use(express.static('public'))
App.use(express.json());
App.use(express.urlencoded({ extended: false }));

// ejecutar el bobyParser para poder enviar en formato json desde un Formulario en en sitio web asi aqui
App.use(bodyParser.urlencoded({ extended: true }));

App.use(cors());

const versionOne = (routeName) => `/api/v1/${routeName}`;

App.get("/", async (req, res, next) => {
  res.json("Thesis Project Portal de Ofertas de Trabajo");
});

App.get("/api/v1/getRemoteJobs", async (req, res, next) => {
  const api = "https://remoteok.com/api?tag=Javascript";
  let data;
  try {
    const response = await axios.get(api);
    data = response;
    console.log(data);

    // res.send(data);
    return data;
  } catch (error) {
    console.log(error);
  }
  return data;
});

App.get(versionOne('getJobs'), async (req, res, next) => {
  const parser = new Parser();
  // let feed = await parser.parseURL('https://www.reddit.com/.rss');
  const rss = await parser.parseURL(
    "https://pe.indeed.com/rss?q=developer&l=Per%C3%BA"
  );
  //https://pe.indeed.com/trabajo?q=developer&l=Perú&sort=date
  //console.log(rss)

  let jobsIndeedArray = [];

  jobsIndeedArray = await getIndeedJobs(rss)

  // console.table(rss.items)
  res.json(indeedjobs={jobs:jobsIndeedArray});

  // rss?.items.forEach(i => {
  //   console.log(i.title + ':' + i.link)
  // })
});


// mas recientes

// https://www.linkedin.com/jobs/search/?geoId=102927786&location=Peru&sortBy=DD

// mas relevantes del ultimo mes https://www.linkedin.com/jobs/search/?f_TPR=r2592000&geoId=102927786&location=Peru&sortBy=R

// ################# Variables to define #################
// username_linkedin = "rogercolquecalcina@gmail.com"
// #username_linkedin = "Roger Colque Calcina"
// password_linkedin = "0987poiu"
// keyword = "developer"
// scrolls = 3
// language = 1
// #######################################################


const getIndeedJobs = async (lista) => {
  try {
    const indeedServiceJobs = lista.items

    const listindeedServiceJobs = [];

    indeedServiceJobs.forEach((indeedJob) => {
      const myJob = {
        title: indeedJob.title,
        link: indeedJob.link,
        pubDate: indeedJob.pubDate,
        content: indeedJob.content,
        contentSnippet: indeedJob.contentSnippet,
        guid: indeedJob.guid,
        isoDate: indeedJob.isoDate,
        type: "indeed",
      };
      listindeedServiceJobs.push(myJob)
    });

    return listindeedServiceJobs;
  } catch (error) {
    console.error(error);
    return []
  }
};

module.exports = App;
