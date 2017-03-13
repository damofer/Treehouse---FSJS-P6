

var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');
var jsonexport = require('jsonexport');
var url = "http://shirts4mike.com/shirts.php"
//If folder 'data' doesnt exist, create it, if it exist, do nothing.
var path ="./data";
if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
}



//first we need to get the info from the shirts.php page,

request(url, function (error, response, body) {

// for this we use cheerio to do the trasversing as we are using jquery.
	let $ = cheerio.load(body);

	let products = $(".products li a");
	let linkList = [];

	//Loop thru each anchor of the product element and then get links of each product
	for(let product in products){
		const attr =products[product].attribs;
		if(attr && attr.href)
			linkList.push(attr.href);
	}


//set an array.
	var itemList = [];

//The scraper should get the price, title, url and image url from the product page and save this information into a CSV file.
//for this we need to crawl each product link and get the info as follows:

//loop for each link
	for(let link in linkList){
		const itemUrl = 'http://www.shirts4mike.com/'+linkList[link];

//each link will have a promise 
  var item = new Promise(function (resolve, reject) {
  	//each promise will make a request to it's corresponding link
		request(itemUrl, function (error, response, body) { 
			//the request will use cheerio to crawl on the html , trasversing
			let $ = cheerio.load(body);
			const shirtPicture = $(".shirt-picture img").attr('src');
			const title = $(".shirt-picture img").attr('alt');
			const price= $('span.price').text();
			//once all the info is collected, now is time to set an object with it.
			let item ={
				Title: title,
				Price: price,
				ImageURL: 'http://www.shirts4mike.com/'+shirtPicture,
				URL: itemUrl,
				Time: moment().format("HH:mm:ss")
			};
			// what we are trying to get is the object so now we resolve the promise asking for item.
			
			 resolve(item);
		});
		}).then(function(res){
			// once the promise is resolved, item will be here as the response.
			return res;
				
		});

		// now that the promise is set, we will push it into an array of promises
		itemList.push(item);
		
		
	}

//end of loop	


//this function will iterate thru each promise, resolve it and then get the result as an array
	Promise.all(itemList).then(values => { 
		
	/*Assume that the the column headers in the CSV need to be in 
	a certain order to be correctly entered into a database.
	 They should be in this order: Title, Price, ImageURL, URL, and Time*/

		try {
		
		  jsonexport(values,function(err, csv){
			    if(err) return console.log(err);


			    var date = moment().format("YYYY-MM-DD");
			     fs.writeFile('./data/'+date+'.csv', csv, function(err) {
			  	if (err) console.log(err);
				  console.log('file saved');
				});
			   
			});
		
		
		} catch (err) {
		  // Errors are thrown for bad options, or if the data is empty and no fields are provided. 
		  // Be sure to provide fields if it is possible that your data array will be empty. 
		  console.error(err);
		}





});
 
});

