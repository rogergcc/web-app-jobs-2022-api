const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const cors = require("cors");
const Parser = require("rss-parser");
const axios = require("axios");

const {
  LinkedinScraper,
  relevanceFilter,
  timeFilter,
  typeFilter,
  experienceLevelFilter,
  events,
} = require("linkedin-jobs-scraper");

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

App.get(versionOne("get-remote-jobs"), async (req, res, next) => {

  const ofertTrabajo = req.query.trabajo

  const api = `https://remoteok.com/api?tag=${ofertTrabajo}`;
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

App.get("/api/v1/jobs", async (req, res, next) => {
  // Each scraper instance is associated with one browser.
  // Concurrent queries will run on different pages within the same browser instance.
  const scraper = new LinkedinScraper({
    headless: true,
    slowMo: 100,
    args: ["--lang=es-GB"],
  });
  let arrayJobs= [];
  // Add listeners for scraper events
  scraper.on(events.scraper.data, (data) => {
    const jobsOffer = {
      location: `${data.location}'`,
      jobId: `${data.jobId}'`,
      title: `${data.title}'`,
      company: `${data.company ? data.company : "N/A"}'`,
      place: `${data.place}'`,
      date: `${data.date}'`,
      link: `${data.link}'`,
      applyLink: `${data.applyLink ? data.applyLink : "N/A"}'`,
      senorityLevel: `${data.senorityLevel}'`,
      jobFunction: `${data.jobFunction}'`,
      employmentType: `${data.employmentType}'`,
      industries: `${data.industries}'`,
    };

    arrayJobs.push(jobsOffer)
    
    console.log(jobsOffer);
    //   console.log(
    //       data.description.length,
    //       data.descriptionHTML.length,
    //       `Query='${data.query}'`,
    //       `Location='${data.location}'`,
    //       `Id='${data.jobId}'`,
    //       `Title='${data.title}'`,
    //       `Company='${data.company ? data.company : "N/A"}'`,
    //       `Place='${data.place}'`,
    //       `Date='${data.date}'`,
    //       `Link='${data.link}'`,
    //       `applyLink='${data.applyLink ? data.applyLink : "N/A"}'`,
    //       `senorityLevel='${data.senorityLevel}'`,
    //       `function='${data.jobFunction}'`,
    //       `employmentType='${data.employmentType}'`,
    //       `industries='${data.industries}'`,
    //   );
  });

  scraper.on(events.scraper.error, (err) => {
    console.error(err);
  });

  scraper.on(events.scraper.end, () => {
    res.json(arrayJobs);
    console.log("All done!");
  });

  // Add listeners for puppeteer browser events
  scraper.on(events.puppeteer.browser.targetcreated, () => {});
  scraper.on(events.puppeteer.browser.targetchanged, () => {});
  scraper.on(events.puppeteer.browser.targetdestroyed, () => {});
  scraper.on(events.puppeteer.browser.disconnected, () => {});

  // Custom function executed on browser side to extract job description
  const descriptionFn = () =>
    document
      .querySelector(".description__text")
      .innerText.replace(/[\s\n\r]+/g, " ")
      .trim();

  // Run queries concurrently
  await Promise.all([
    // Run queries serially
    scraper.run(
      [
        {
          query: "Desarollador",
          options: {
            locations: ["Lima, Perú"], // This will override global options ["Europe"]
            filters: {
              type: [typeFilter.FULL_TIME, typeFilter.CONTRACT],
            },
          },
        }
        
      ]
      
      , { // Global options, will be merged individually with each query options
        locations: ["America"],
        optimize: true,
        limit: 33,
    }),
  ]);

  
  // Close browser
  await scraper.close();
});

App.get(versionOne('getJobs'), async (req, res, next) => {
  const parser = new Parser();
  // let feed = await parser.parseURL('https://www.reddit.com/.rss');

  const ofertTrabajo = req.query.trabajo
  const rss = await parser.parseURL(
    `https://pe.indeed.com/rss?q=${ofertTrabajo}&l=Per%C3%BA`
  );
  //https://pe.indeed.com/trabajo?q=developer&l=Perú&sort=date
  //console.log(rss)

  let jobsIndeedArray = [];

  jobsIndeedArray = await getIndeedJobs(rss)

  // console.table(rss.items)
  res.json(indeedjobs=jobsIndeedArray);

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
