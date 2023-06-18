const axios = require("axios");
const cheerio = require("cheerio");
const {Parser} = require("json2csv");
const fs = require("fs");

async function fetchData() {
  const url = "https://www.nobroker.in/flats-for-sale-in-koramangala_bangalore";
  let propertyArray=[];
  let promiseArray = [];
  const response = await axios.get(url);
  if (response.status === 200) {
    const html = response.data;
    const $ = cheerio.load(html);
    $(
      "#listCardContainer > div.infinite-scroll-component__outerdiv > div > article"
    ).each((index, element) => {
      const area = $(element).find("#unitCode").text();
      const propertyURL = $(element).find("a").attr("href");
      promiseArray.push(getPropertyAge(propertyURL));
      propertyArray.push({
        area,
        url: url + propertyURL,
      });
    });
  }
  const properties = await Promise.all(promiseArray);
  properties.forEach((age, index)=>{
    propertyArray[index].age = age;
  })
  // console.log(propertyArray);
  const parserObj = new Parser;
  const csv = parserObj.parse(propertyArray);
  fs.writeFileSync('./data.csv',csv);

  // console.log(csv);
}

async function getPropertyAge(propertyURL) {
  const baseURL = "https://www.nobroker.in";
  const fullURL = baseURL + propertyURL;

  const response = await axios.get(fullURL);
  if (response.status === 200) {
    const html = response.data;
    const $ = cheerio.load(html);

    const propertyAge = $(
      "#property-detail-body > div > div.nb__3TcJa > div > div > section:nth-child(2) > div > div.nb__310wT > div:nth-child(1) > div > div.nb__28cwR > div:nth-child(1) > div.nb__2xbus > h5"
    ).text();
    return propertyAge;
  }
}

fetchData();
