const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const cors = require("cors");
const Parser = require("rss-parser");
const axios = require("axios");

const puppeteer = require("puppeteer");

const BASE_URL =
  "https://www.linkedin.com/jobs/search?keywords=React.js&location=Per%C3%BA&geoId=102927786&trk=public_jobs_jobs-search-bar_search-submit&position=1&pageNum=0";

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
  const ofertTrabajo = req.query.trabajo;

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
    args: ["--lang=en-GB"],
  });
  let arrayJobs = [];
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

    arrayJobs.push(jobsOffer);

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
    scraper.run([
      {
        query: "Desarollador",
        options: {
          locations: ["Lima, Perú"], // This will override global options ["Europe"]
          filters: {
            type: [typeFilter.FULL_TIME, typeFilter.CONTRACT],
          },
        },
      },
    ]),
  ]);

  // Close browser
  await scraper.close();
});

App.get(versionOne("getLinkedinJobs"), async (req, res, next) => {
  const browser = await puppeteer.launch({ headless: false });
  // const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // page.on('console', consoleObj => console.log(consoleObj.text()))
  await page.goto(BASE_URL);

  await delay(5000);

  await page.waitForSelector(".jobs-search__results-list");
  const datos = await page.waitForSelector(
    "section.two-pane-serp-page__results-list > ul > li:nth-child(1) > div > a"
  );
  // await delay(5000);

  const title = await page.title();

  const getLinkedinJobs = await page.evaluate(() => {
    const primeministers = [];
    const containers = document.querySelector(
      "section.two-pane-serp-page__results-list > ul.jobs-search__results-list"
    );
    const pms = containers.querySelectorAll("li > div");
    pms.forEach((element) => {
      const titleSelector = element.querySelector(".base-card__full-link span");
      const empresa = element.querySelector(".base-search-card__subtitle a");
      const lugarSelector = element.querySelector(
        ".base-search-card__metadata span"
      );
      const fechaSelector = element.querySelector(
        ".base-search-card__metadata time"
      );
      const linkSelector = element.querySelector(".base-card__full-link");
      // const h4 = element.querySelector(".base-search-card__subtitle > a.hidden-nested-link");

      const title = titleSelector.innerHTML;
      const empresaData = empresa.innerHTML;

      const link = linkSelector.href;
      const lugar = lugarSelector.innerHTML;
      const fecha = fechaSelector.getAttribute("datetime");
      primeministers.push({
        title: title.trim(),
        link: link.trim(),
        empresa: empresaData.trim(),
        pais: lugar.trim(),
        fecha: fecha.trim(),
        type: "linkedin",
      });
    });
    return primeministers;
  });

  res.json((linkedinjobs = getLinkedinJobs));
});

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

App.get(versionOne("getJobs"), async (req, res, next) => {
  const parser = new Parser();
  // let feed = await parser.parseURL('https://www.reddit.com/.rss');

  const ofertTrabajo = req.query.trabajo;
  const rss = await parser.parseURL(
    // `https://pe.indeed.com/rss?q=${ofertTrabajo}&l=Per%C3%BA`
    `https://pe.indeed.com/rss?q=${ofertTrabajo}&l=Peru&sort=date`
  );
  //https://pe.indeed.com/trabajo?q=developer&l=Perú&sort=date
  //console.log(rss)

  let jobsIndeedArray = [];

  jobsIndeedArray = await getIndeedJobs(rss);

  let jobsLinkedinArray = [];

  jobsLinkedinArray = await getLinkedinJobs(ofertTrabajo);

  jobs= jobsIndeedArray.concat(jobsLinkedinArray)

  res.json((jobs = jobs));


});



const getLinkedinJobs= async(jobsSearch)=>{

  try {
      // const browser = await puppeteer.launch({ headless: false });
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // page.on('console', consoleObj => console.log(consoleObj.text()))

  const SEARCH_URL =`https://www.linkedin.com/jobs/search?keywords=${jobsSearch}&location=Per%C3%BA&geoId=102927786&trk=public_jobs_jobs-search-bar_search-submit&position=1&pageNum=0`;


  await page.goto(SEARCH_URL);

  await delay(5000);

  await page.waitForSelector(".jobs-search__results-list");
  const datos = await page.waitForSelector(
    "section.two-pane-serp-page__results-list > ul > li:nth-child(1) > div > a"
  );
  
  const getLinkedinJobs = await page.evaluate(() => {
    const jobsList = [];
    const containers = document.querySelector(
      "section.two-pane-serp-page__results-list > ul.jobs-search__results-list"
    );
    const pms = containers.querySelectorAll("li > div");
    pms.forEach((element) => {
      const titleSelector = element.querySelector(".base-card__full-link span");
      const empresa = element.querySelector(".base-search-card__subtitle a");
      const lugarSelector = element.querySelector(
        ".base-search-card__metadata span"
      );
      const fechaSelector = element.querySelector(
        ".base-search-card__metadata time"
      );
      const linkSelector = element.querySelector(".base-card__full-link");
      // const h4 = element.querySelector(".base-search-card__subtitle > a.hidden-nested-link");

      const title = titleSelector.innerHTML;
      const empresaData = empresa.innerHTML;

      const link = linkSelector.href;
      const lugar = lugarSelector.innerHTML;
      const fecha = fechaSelector.getAttribute("datetime");

  
      jobsList.push({
        title: title.trim(),
        link: link.trim(),
        pubDate: fecha.trim(),
        content: '-',
        contentSnippet: '-',
        company: empresaData.trim(),
        location: lugar.trim(),
        
        type: "linkedin",
      });
    });
    return jobsList;
  });
    return getLinkedinJobs
  } catch (error) {
    return [];
  }
}
const getIndeedJobs = async (lista) => {
  try {
    const indeedServiceJobs = lista.items;

    const listindeedServiceJobs = [];

    indeedServiceJobs.forEach((indeedJob) => {
      //`Company='${data.company ? data.company : "N/A"}'`,
      let title = indeedJob.title
      let location = indeedJob.title
      let company = indeedJob.title
      
      const myJob = {
        title: title.split('-')[0].trim,
        link: indeedJob.link,
        pubDate: indeedJob.pubDate,
        content: indeedJob.content,
        contentSnippet: indeedJob.contentSnippet,
        company: (company.split('-').slice(-2,-1)+"").trim(),
        location: (location.split('-').slice(-1)+"").trim(),
        // guid: indeedJob.guid,
        // isoDate: indeedJob.isoDate,
        type: "indeed",
      };
      listindeedServiceJobs.push(myJob);
    });

    return listindeedServiceJobs;
  } catch (error) {
    console.error(error);
    return [];
  }
};

module.exports = App;
