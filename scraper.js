

var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
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
				title: title,
				price: price,
				image_url: 'http://www.shirts4mike.com/'+shirtPicture,
				item_url: itemUrl
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
  console.log(values); 
});
 
});


