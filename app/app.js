const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const cors = require("cors");
const Parser = require("rss-parser");
const axios = require("axios");

const puppeteer = require("puppeteer");

const BASE_URL =
  "https://www.linkedin.com/jobs/search?keywords=React.js&location=Per%C3%BA&geoId=102927786&trk=public_jobs_jobs-search-bar_search-submit&position=1&pageNum=0";

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

App.get(versionOne("getLinkedinJobs"), async (req, res, next) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  // const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // page.on('console', consoleObj => console.log(consoleObj.text()))
  await page.goto(BASE_URL);

  await delay(4000);

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

  let jobsIndeedArray = [];
  jobsIndeedArray = await getIndeedJobs(rss);

  let jobsLinkedinArray = [];
  jobsLinkedinArray = await getLinkedinJobs(ofertTrabajo);

  let jobsgetGetOnBoardJobsArray = [];
  jobsgetGetOnBoardJobsArray = await getGetOnBoardJobs(ofertTrabajo);

  jobs = jobsIndeedArray.concat(jobsLinkedinArray, jobsgetGetOnBoardJobsArray);

  res.json((jobs = jobs));
});

const getLinkedinJobs = async (jobsSearch) => {
  let browser, page;

  try {
    // const browser = await puppeteer.launch({ headless: false });
    browser = await puppeteer.launch({
      args: ["--no-sandbox"],
      // ,"--disable-setuid-sandbox"],
      // ignoreDefaultArgs: ["--disable-extensions"],
      headless: true,
    });

    // const browser = await puppeteer.launch();
    page = await browser.newPage();

    const navigationPromise = page.waitForNavigation({
      waitUntil: "domcontentloaded",
    });
    // page.on('console', consoleObj => console.log(consoleObj.text()))

    const SEARCH_URL = `https://www.linkedin.com/jobs/search?keywords=${jobsSearch}&location=Per%C3%BA&geoId=102927786&trk=public_jobs_jobs-search-bar_search-submit&position=1&pageNum=0`;

    await page.goto(SEARCH_URL);
    await navigationPromise;
    await delay(3000);

    await page.waitForSelector(".jobs-search__results-list");

    const getLinkedinJobs = await page.evaluate(() => {
      let jobsList = [];
      const containers = document.querySelector(
        "section.two-pane-serp-page__results-list > ul.jobs-search__results-list"
      );
      const pms = containers.querySelectorAll("li > div");
      [...pms].map((element) => {
        const titleSelector = element.querySelector(
          ".base-card__full-link span"
        );
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
          content: "-",
          contentSnippet: "-",
          company: empresaData.trim(),
          location: lugar.trim(),

          type: "linkedin",
        });
      });
      return jobsList;
    });
    //console.log(getLinkedinJobs)

    return getLinkedinJobs;
  } catch (err) {
    console.error("ERROR err: " + err);
    console.log("scrape error.message", err.message);
    // console.log('error in getLinkedinJobs():', err)
    // console.log("LOG_ERROR:" + err);

    return [{ nodata: "nodata jobs" }];
  } finally {
    if (browser) {
      await browser.close();
      console.log("closing browser");
    }
  }
};
const getIndeedJobs = async (lista) => {
  try {
    const indeedServiceJobs = lista.items;

    const listindeedServiceJobs = [];

    indeedServiceJobs.forEach((indeedJob) => {
      //`Company='${data.company ? data.company : "N/A"}'`,
      let title = indeedJob.title;
      let location = indeedJob.title;
      let company = indeedJob.title;

      const myJob = {
        title: title.split("-")[0].trim,
        link: indeedJob.link,
        pubDate: indeedJob.pubDate,
        content: indeedJob.content,
        contentSnippet: indeedJob.contentSnippet,
        company: (company.split("-").slice(-2, -1) + "").trim(),
        location: (location.split("-").slice(-1) + "").trim(),
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

const getGetOnBoardJobs = async (ofertTrabajo) => {
  const api = `https://www.getonbrd.com/api/v0/search/jobs?query=${ofertTrabajo}&per_page=10&page=1&expand=["company"]`;

  try {
    var config = {
      method: 'get',
      url: api,
      headers: { }
    };

    const listgetonboardServiceJobs = [];

    const response = await axios(config)
    // const response = await axios.get(api);
    const responseJobs = await response.data.data;

    responseJobs.forEach((element) => {
      const myJob = {
        title: element.attributes.title,
        link: element.links.public_url,

        content: element.attributes.description,
        contentSnippet: element.attributes.functions,
        company: element.attributes.company.data.type,
        location: `${element.attributes.remote_zone } / ${element.attributes.country}`,

        min_salary: element.min_salary || "-",
        max_salary: element.max_salary || "-",

        type: "getonbrd",
      };

      listgetonboardServiceJobs.push(myJob);
    });

    return listgetonboardServiceJobs;
  } catch (error) {
    console.log(error);
    console.error(error);
    return [];
  }
};
module.exports = App;
