/*

******** PROJETO CLASSIFICATÓRIO - ROCKY FULL DIGITAL PERFORMANCE ********
Estêvão Barros Chaves - Estudante de Tecnologia da Informação 
estevao.bchaves@gmail.com - (16)92000-3525

*/

"use strict";
const fs = require('fs');
const https = require('https');
var file = 'raw.txt';
const url = "https://gitlab.com/-/snippets/1818996/raw";

// function1 - read JSON file (broken-database)
fs.readFile(file, (_err, rawData) => { //method to read file from local path 
    try { 
        saveFile(rawData);   //send raw data to auxiliar function 
        console.log('Successfully loaded from local server');                                 
    } catch (err) {
        file = url; // sets file to the url constant 
        readFileServer(file); // calls this funtion if data from local path is not avaliable 
    };   
});
function readFileServer(file){   
    https.get(file,(res) => { //gets data from web server
        var rawData = ""; // variable will contain raw JSON data 
        res.on("data", (data) => {
            rawData += data; // variable receive raw JSON data 
        });
        res.on("end", () => {
            saveFile(rawData); //send raw data to auxiliar function  
            console.log('Successfully loaded from https://gitlab.com/-/snippets/1818996/raw \t')
        });
        }).on("error", (error) => {
            console.error(error.message);
        });    
};

// auxiliar function
function saveFile(rawData){
    var data = JSON.parse(rawData); // variable containing the converted to JavaScript object 
    //send js object to correction functions 
    correctName(data); 
    correctPrice(data);  
    correctQuantity(data);
} 

// function2 - Correct names 
function correctName(data) {
    const wrongLetter = [/ø/g, /æ/g, /¢/g, /ß/g] //affected letters (RegEx)
    const rightLetter =  ['o', 'a', 'c', 'b'] //correct letters 
    //loop for each index inside data object 
    Object.keys(data).forEach(i => {
         if(data[i].name.search('Wi-F') != -1){data[i].name += 'i'} //treats error exception Wi-F to Wi-fi. 
        //detect and replace globally wrong letters with RegEx, replacing bt the correct letters.
        wrongLetter.forEach((letter, key) => {
            data[i].name = data[i].name.replace(letter, rightLetter[key]);
        }); 
    });
};

// function3 - Correct prices 
function correctPrice(data){
    Object.keys(data).forEach(i => {
        data[i].price = Number(data[i].price) // convert all prices in Number type
    });   
};

//function4 - Correct quantities
function correctQuantity(data){
    Object.keys(data).forEach(i => {
        // if quantity not exists as a number, set equals to 0, else converts to Integer
        isNaN(data[i].quantity) ? data[i].quantity = 0 : data[i].quantity = parseInt(data[i].quantity) 
    }); 
       writeFile(JSON.stringify(data, null, '\t')); //convert the data to JSON and sends to function writeFile()
};

//function 5 - Export JSON file with correct DataBase *** create or update 'saida.json'
async function writeFile(data){
    fs.writeFile('saida.json', data,  (err) => {
        if (err) throw err;
        });
        try {
            var finalData = await JSON.parse(data)  //waits for receive the data and converts to be use in validation
            //send correct js object for validation
            validationName(finalData);
            validationQuantity(finalData);                  
        } catch (error) {
            console.error(error.message);
    };     
};
 //***VALIDATION***
 //function1(validation) - print the list of all names ordened alfabetically by category and crescently by id 
 function validationName(finalData){
     //organize finalData object alfabetically by category and in case of equal categories by id
    finalData.sort((a,b) => {
        return a.category < b.category ? -1 : a.category > b.category ? 1 : 0 || (a.id - b.id)
    });   
    var productList = [] // produtList will receive the product names 
    // add the organized names in the list productList   
    Object.keys(finalData).forEach(i => {
        productList.push(finalData[i].name)
    });
    //print the product names by category and id in JSON format 
    console.log("Product names by category and id: ", JSON.stringify(productList, null, '\t'))   
};

//function2(validation) - calculate total value stock bt category and prints in JSON format.
function validationQuantity(finalData){
    var categoryName = []  // list  receives the category names 
    var valueByCategory = [] // list receives the category values of stock
    
    // checks if category name exists in categoryName list  
    Object.keys(finalData).forEach(i => { 
        // if category name does not exists in the list, add in the categoryName and the the total stock value (quantity * price) in the lists
        if(!categoryName.includes(finalData[i].category)){ 
            categoryName.push(finalData[i].category) && 
            valueByCategory.push(finalData[i].quantity * finalData[i].price)
        //  else, if category name already exists, increase the value of stock of that category (last index of the list category name)
        } else{
            valueByCategory[categoryName.lastIndexOf(finalData[i].category)] += finalData[i].quantity * finalData[i].price
        }
    });
    var storage = {};
    // convert the two lists of category names and value of stock in a object
    valueByCategory.forEach((key, i) => storage[categoryName[i]] = key);  
    // convert and print in JSON format
    console.log("Storage price by category: ", JSON.stringify(storage, null, '\t'))
};