const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const cors = require("cors");
// const Parser = require("rss-parser");
const { parse } = require('rss-to-json');
const axios = require("axios");

const cheerio =require ('cheerio');
const puppeteer = require("puppeteer");

const App = express();
//https://pe.indeed.com/jobs?q=android&l=Per%C3%BA&vjk=657c9c57c97c700b

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

//#region JwT todoas las rutas con jwt -- descomentar para crear el 1er usuario



App.get(versionOne("getLinkedinJobs"), async (req, res, next) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  // const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // page.on('console', consoleObj => console.log(consoleObj.text()))
  await page.goto(BASE_URL);

  // await delay(4000);

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

App.get(versionOne("getJobs"), async (req, res, next) => {
  //const parser = new Parser();
  // let feed = await parser.parseURL('https://www.reddit.com/.rss');

  const ofertTrabajo = req.query.trabajo;
  // const rss = await parser.parseURL(
  //   // `https://pe.indeed.com/rss?q=${ofertTrabajo}&l=Per%C3%BA`
  //   `https://pe.indeed.com/rss?q=${ofertTrabajo}&l=Peru&sort=date`
  // );

  const rss = await parse(`https://pe.indeed.com/rss?q=${ofertTrabajo}&l=Peru&sort=date`);
  
  //https://pe.indeed.com/trabajo?q=android&l=Per%C3%BA&vjk=657c9c57c97c700b

  // console.log("datosRSS",rss)

  // let jobsIndeedArray = [];
  // jobsIndeedArray = await getIndeedJobs(rss);

  // let jobsLinkedinArray = [];
  // jobsLinkedinArray = await getLinkedinJobs(ofertTrabajo);
  // let jobsgetGetOnBoardJobsArray = [];
  // jobsgetGetOnBoardJobsArray = await getGetOnBoardJobs(ofertTrabajo);
  console.log("OFERTA : "+ofertTrabajo)
  // const result = await scrapeIndeed(ofertTrabajo)
  // console.log(result)

  const [jobsIndeedArray, mGetonboardJobs] = await Promise.all([getIndeedJobs(rss), getGetOnBoardJobs(ofertTrabajo)]);
  // const [jobsIndeedArray, mGetonboardJobs] = await Promise.all([scrapeIndeed(ofertTrabajo), getGetOnBoardJobs(ofertTrabajo)]);

  jobs = jobsIndeedArray.concat(mGetonboardJobs);

  res.json((jobs = jobs));
});

const getLinkedinJobs = async (jobsSearch) => {
  let browser, page;

  try {
    // const browser = await puppeteer.launch({ headless: false });
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
      ignoreDefaultArgs: ["--disable-extensions"],
      headless: true,
    });

    // const browser = await puppeteer.launch();
    page = await browser.newPage();

    // const navigationPromise = page.waitForNavigation({
    //   waitUntil: "domcontentloaded",
    // });

    // page.on('console', consoleObj => console.log(consoleObj.text()))

    const SEARCH_URL = `https://www.linkedin.com/jobs/search?keywords=${jobsSearch}&location=Per%C3%BA&geoId=102927786&trk=public_jobs_jobs-search-bar_search-submit&position=1&pageNum=0`;

    // Configure the navigation timeout
    await page.goto(SEARCH_URL, {
      waitUntil: "load",
      // Remove the timeout
      timeout: 0,
    });

    // await page.goto(SEARCH_URL);

    // await navigationPromise;

    // await delay(3000);

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

    //USE THIS "Api" xml result because give the URL link
    //using scraping with cherio not working always cause some data link Id url and salary is from Javascript dynamic data.
    
    //console.log(lista)
    const indeedServiceJobs = lista.items;
     
    const listindeedServiceJobs = [];

    indeedServiceJobs.forEach((indeedJob) => {
      //`Company='${data.company ? data.company : "N/A"}'`,
      let title = indeedJob.title;
      let location = indeedJob.title;
      let company = indeedJob.title;
      let linkUrl = ''
      linkUrl = indeedJob.link
      linkUrl = linkUrl.replace(/&amp;/g,"&");

      const date = new Date().toLocaleDateString(indeedJob.published);
      const date2 = timeAgo(indeedJob.published);

      let description = ''
      description =indeedJob.description.split('&lt;br>')[0]
      
      let salary = ''

      const indexSalaryMoneda= description.indexOf('S/.')

      salary= (indexSalaryMoneda != -1)?"S"+description.slice(description.indexOf('S/.') + 1): '-'

      const myJob = {
        image: 'https://pe.indeed.com/images/indeed_rss_2_es.png',
        title: title,
        link: linkUrl,
        date: date,
        date2:date2,
        // content: indeedJob.content,
        content: description, //&lt;br>
        //contentSnippet: indeedJob.contentSnippet,
        company: (company.split("-").slice(-2, -1) + "").trim(),
        // company: company.trim(),
        location: (location.split("-").slice(-1) + "").trim(),
        // guid: indeedJob.guid,
        // isoDate: indeedJob.isoDate,
        min_salary: "-",
        max_salary: "-",
        salary: salary,
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

function timeAgo(input) {
  const date = (input instanceof Date) ? input : new Date(input);
  const formatter = new Intl.RelativeTimeFormat('en');
  const ranges = {
    years: 3600 * 24 * 365,
    months: 3600 * 24 * 30,
    weeks: 3600 * 24 * 7,
    days: 3600 * 24,
    hours: 3600,
    minutes: 60,
    seconds: 1
  };
  const secondsElapsed = (date.getTime() - Date.now()) / 1000;
  for (let key in ranges) {
    if (ranges[key] < Math.abs(secondsElapsed)) {
      const delta = secondsElapsed / ranges[key];
      return formatter.format(Math.round(delta), key);
    }
  }
}

async function scrape(oferta) {
  const url = `https://pe.indeed.com/trabajo?q=${oferta}&l=Perú`;
  // ? Get HTML of the website
  const response = await axios.get(url)
  const html = response.data

  // ? Load HTML to cheerio
  const $ = cheerio.load(html)
  
    // ? Loop through the product element
  const productData = $('div.slider_container').map((_, element) => {
    const productElement = $(element)
    const title = productElement.find('div.heading4 span').text()
    // const price = productElement.find('p.price_color').text()
    // const cover = productElement.find('img.thumbnail').prop('src')
    // const ratingClass = productElement.find('p.star-rating').attr('class').split(' ')
    //   .filter((elementClass) => elementClass !== 'star-rating')[0] || ''
    // const available = productElement.find('p.instock.availability').length > 0
    // const bookUrl = productElement.find('.image_container > a').prop('href')

    return {
      title,
      // price,
      // cover: `${url}${cover}`,
      // rating: ratingMap[ratingClass.toLocaleLowerCase()],
      // available,
      // bookUrl
    }
  }).get()
  
  return productData
}

const scrapeIndeed = async (ofertTrabajo)=>{
  //https://pe.indeed.com/trabajo?q=android&l=Per%C3%BA&vjk=657c9c57c97c700b
  const api = `https://pe.indeed.com/jobs?q=${ofertTrabajo}&l=Per%C3%BA&vjk=657c9c57c97c700b`;

  try {
  
    //https://pe.indeed.com/ver-empleo?t=Desarrollador%20Back-end%20(Java)&c=AAT%20Log%C3%ADstica%20Certificada&l=Lima,+Lima&jk=e8eebe367acc796e
    // const responseJobs = await response.data.data;

    const response = await axios.get(api)
    const html = response.data
  
    // ? Load HTML to cheerio
    const $ = cheerio.load(html)
    
      // ? Loop through the product element
    let articles = []

    //cardOutline tapItem fs-unmask result job_1dd43288d7d3f9c3 resultWithShelf sponTapItem desktop
    
    const productData = $('div.slider_item').map((_, element) => {
    // const productData = $('li div.cardOutline').map((_, element) => {
      const productElement = $(element)
      // const el = productElement.find('h2.jobTitle a').href()
      const title = productElement.find('h2.jobTitle').text()
      const company = productElement.find('.companyName').text()
      const companyLocation = productElement.find('.companyLocation').text()
      const description = productElement.find('.job-snippet').text()
      const date = productElement.find('.date').text()

      const salary = (productElement.find('.attribute_snippet').text()==null)? '$': productElement.find('.attribute_snippet').text()
      
      const jobUrl = productElement.find('.jobTitle a').attr('href');
      const jobIdForUrl = productElement.find('h2.jobTitle a').data('jk')
      //https://pe.indeed.com/trabajo/Desarrollador-bi-1dd43288d7d3f9c3

      const titleJoin = title.replace(' ','-')
      //https://pe.indeed.com/ver-empleo?t=DESARROLLADOR%20DE%20BI&jk=1dd43288d7d3f9c3

      const urlGenerate = `https://pe.indeed.com/ver-empleo?t=${title}&c=${company}&l=${companyLocation}&jk=e8eebe367acc796e`
      const urlGenerate2 = `https://pe.indeed.com/ver-empleo?t=${title}&jk=${jobIdForUrl}`
      //https://pe.indeed.com/ver-empleo?t=Desarrollador%20Back-end%20(Java)&c=AAT%20Log%C3%ADstica%20Certificada&l=Lima,+Lima&jk=e8eebe367acc796e
      
      // const elmento = productElement.text()

      // articles.push({
      //   image: "https://pe.indeed.com/images/indeed_rss_2_es.png",
      //   title,
      //   link: urlGenerate2,
      //   company,
      //   salary,
      //   urlGenerate,
      //   jobIdForUrl,
      //   jobUrl,
      //   location: companyLocation,
      //   content: description,
      //   date,
      //   type: "indeed",
      // });

      return {
        image: "https://pe.indeed.com/images/indeed_rss_2_es.png",
        title,
        link: urlGenerate2,
        company,
        salary,
        urlGenerate,
        jobIdForUrl,
        jobUrl,
        location: companyLocation,
        content: description,
        date,
        type: "indeed",
      };
    }).get()

    return productData

  }
  catch(error){
    console.log(error);
    console.error(error);
    
  }
}
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

    //console.log(responseJobs)
    // const date = timeAgo(indeedJob.attributes.published_at);
    responseJobs.forEach((element) => {

      
      const date2 = new Date().toLocaleDateString(element.attributes.published_at);
      const date = timeAgo(element.attributes.published_at);

      // const date2 = new Date().toLocaleDateString(element.attributes.published_at);
      // const date = timeAgo(element.attributes.published_at);

       //date = timeAgo(date);
      const myJob = {
        image: element.attributes.company.data.attributes.logo,
        title: element.attributes.title,
        link: element.links.public_url,
        date: date2,
        date2:date,
        content: element.attributes.description,
        contentSnippet: element.attributes.functions,
        // company: element.attributes.company.data.type,
        company: element.attributes.company.data.attributes.name,
        location: `${element.attributes.remote_zone } / ${element.attributes.country}`,
        min_salary: element.attributes.min_salary+" USD/mes" || "- USD/mes",
        max_salary: element.attributes.max_salary+" USD/mes" || "- USD/mes",
        salary: `${element.attributes.min_salary} a ${element.attributes.max_salary} USD/mes`,
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
