require('dotenv').config();
const today = new Date()
var year = today.getFullYear();
var mes = today.getMonth()+1;
var dia = today.getDate();
var dateString2 =year+"-"+mes+"-"+dia;
const yesterday = new Date(today)
yesterday.setDate(yesterday.getDate() - 1)

var year = yesterday.getFullYear();
var mes = yesterday.getMonth()+1;
var dia = yesterday.getDate();
var dateString =year+"-"+mes+"-"+dia;


const cron = require('node-cron');
const { init } = require('@emailjs/browser');
init("4PkEg2xilw3A4Fr36");
var dict = {}
const { MongoClient, ObjectId } = require('mongodb');
const { get } = require('express/lib/request');
const dbconnect = require('./mongodb')

console.log(dateString)
function getFrequency(data) {
    var freq = {};
    for (var i = 0; i < data.length; i++) {
        var character = data[i].signer.companyId;
        if (freq[character]) {
            freq[character]++;
        } else {
            freq[character] = 1;
        }
    }

    return freq;
};



const nodemailer = require("nodemailer");

async function main2(companyName,tableData,fileNames,fileDict) {
  let message=('<head><style>a:link {color: skyblue;text-decoration:None} table, th, td {border: 1px solid black;border-collapse: collapse;table-layout: fixed;text-align:centre;border-spacing: 5px;padding:7px;}</style></head>'+
    '<body text-align="centre" style="border: 10px solid grey; padding: 5px; margin:0%;">'+
    '<div >'+
    `<img style="width: 100px;float:left" src="https://validateme.online/wp-content/uploads/2021/07/featured-image.jpg"/>`+
    '<h4 float:left style="text-align: right;padding: 10px;color: gray;">Daily Issuance Report</h4></div>'+
    '<hr>'+
    '<div style="text-align: center;">'+
    '<img  style="width:300px;" src="https://www.linkpicture.com/q/logo_280.png">'+
    `<h4 style="padding-left: 10px;padding-right: 10px;color: gray;">Here's summary of all credentials issued on ${dateString}</h4>`+
    '</div>'
     );
   message += (
    '<table style="border: 1px solid black;border-collapse: collapse;width:100%;">' +
    '<thead><th style="background-color:rgb(228, 221, 221);">Issuer Name</th><th style="background-color:rgb(228, 221, 221);">Total No. of Document Issued</th><th style="background-color:rgb(228, 221, 221);">User Name</th><th style="background-color:rgb(228, 221, 221);">Document Name</th><th style="background-color:rgb(228, 221, 221);">Doc per User</th></thead>'

  ); 
  for(let issuerName of Object.keys(companyName)) {
    let userNames=tableData[issuerName]
    let rowSpan=Object.keys(userNames).length
   message += (
    `<tr ><td rowspan="${rowSpan+1}">${issuerName}</td><td rowspan="${rowSpan+1}">${companyName[issuerName]}</td></tr>`
    

   );


   for(let person of Object.keys(userNames)){
     let msg=''
     
     for (let i=0;i<fileNames[person].length;i++){
      // console.log(fileDict[fileNames[person][i]])
       msg+=(`<a style="color: skyblue;text-decoration:None;word-wrap: break-word;" href='https://systest.validateme.online/qr/${fileDict[fileNames[person][i]]}'>${fileNames[person][i]}</a><br>`)

     }
    message += (
        `<tr ><td >${person}</td>`+
        `<td >${msg}</td>`+
        `<td >${userNames[person]}</td></tr>`
        
    
       );

    
   }





// console.log(files[q])

}
message +=  '</table>';
  let testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_FROM, // generated ethereal user
      pass:process.env.EMAIL_PASSWORD , // generated ethereal password
    },
  });
// rohitkumar@affidabilesolutions.com
//ipsapratibimbita@affidabilesolutions.com, 
  let info = await transporter.sendMail({
    from: process.env.EMAIL_FROM, 
    to: process.env.EMAIL_TO ,
    subject: "Daily Issuance Report", 
   
    html: message
  });
// console.log(message)
console.log("Message sent: %s", info.messageId);
}
const main = async () => {
  try{
    let datab = await dbconnect();
    
    let data = datab.collection('signeddocuments')//22280
    data = await data.find({ "signer.signedOn": { "$gt": new Date(dateString),"$lt":new Date(dateString2) } }).toArray()
    console.warn(data.length);
 
    
    let docPerComp = getFrequency(data)
   
    let docpercompany={}
var items = Object.keys(docPerComp ).map(
    (key) => { return [key, docPerComp [key]] });

  items.sort(
    (first, second) => { return  second[1]-first[1]}
  );
  
  var keys = items.map(
    (e) => { return e[0] });
  // console.log(docPerComp)
  for (let i=0;i<keys.length;i++){
    docpercompany[keys[i]]=docPerComp[keys[i]]
    delete docPerComp[keys[i]]
    docPerComp[keys[i]]=docpercompany[keys[i]]
  }
// console.log(docpercompany)


 
  let companyName={}


  for (const key of Object.keys(docpercompany)) {
    //console.log(key)
 
    let data = datab.collection('companies')
    data = await data.find( {_id: new ObjectId(key)}).toArray()
    let arr=[]
 
    if (companyName[data[0].name]) {
    companyName[data[0].name]=companyName[data[0].name]+docPerComp[key]
 
  } else {
     companyName[data[0].name]=docPerComp[key];
  }
  delete docpercompany[key]
  docpercompany[key]=data[0].name
  }





    let dic = {}
    for (var key of Object.keys(docPerComp)) {
        var companyid = key
        // console.log(key)
        let data = datab.collection('signeddocuments')//22280
        data = await data.find({ "signer.signedOn": { "$gte": new Date(dateString),"$lt":new Date(dateString2) }, "signer.companyId": new ObjectId(companyid) }).toArray()
        // console.log(data[1]) 
        var docPerUser= []
        for (let i = 0; i < data.length; i++) {
            if (docPerUser[data[i].signer.companyUserId]) {
              docPerUser[data[i].signer.companyUserId]++

            }
            else {
              docPerUser[data[i].signer.companyUserId] = 1
            }
        }
        

         let u=docPerUser
        
         let a=[]
         var items = Object.keys(u).map(
          (key) => { return [key, u[key]] });       
        items.sort(
          (first, second) => { return  second[1]-first[1]}
        );
        var keys = items.map(
          (e) => {return e[0]});
        for (let i=0;i<keys.length;i++){
            a[keys[i]]=u[keys[i]]
        }
        //console.log(a)
        dic[companyid] = a

    }
  //  console.log(dic)
    let fileNames={}
    let fileDict={}
    for (let companyid of Object.keys(dic)) {
        for (let companyuserid of Object.keys(dic[companyid])) {
          
            let noOfFiles=3
            if (noOfFiles>dic[companyid][companyuserid]){
                noOfFiles=dic[companyid][companyuserid]
            }
            
            
            data = datab.collection('signeddocuments')
            data = await data.find({  "signer.signedOn": { "$gte": new Date(dateString),"$lt":new Date(dateString2)} , "signer.companyId":new ObjectId(companyid) ,"signer.companyUserId":companyuserid,"isDeleted":false},
            {"fileName":1}).limit(noOfFiles).project({fileName:1,displayId:1 ,isDeleted:1,_id: 0}).toArray()
            
            if( data.length<3){
              dataNew = datab.collection('signeddocuments')
              let data_exist= await dataNew.find({  "signer.signedOn": { "$gte": new Date(dateString),"$lt":new Date(dateString2)} , "signer.companyId":new ObjectId(companyid) ,"signer.companyUserId":companyuserid,"isDeleted":true},
            {"fileName":1}).limit(noOfFiles).project({fileName:1,displayId:1 ,isDeleted:1,_id: 0}).toArray()
         
            for (let i=0; i<data_exist.length;i++){
            data.push(data_exist[i])
          }
            
            }
            
            let nameoffile=[]
            if (data.length!=0){
            
            for (let i=0;i<noOfFiles;i++){
                nameoffile.push(data[i].fileName)
                fileDict[data[i].fileName]=data[i].displayId
            }
           
            fileNames[companyuserid]=nameoffile
            
          }
          // console.log(nameoffile)


            data_user = datab.collection('personals')
            data_user = await data_user.find({ "uid": companyuserid }).project().toArray()
            // console.log(data.length)
            if (data_user.length===1){
              var arr=[]
              dic[companyid][data_user[0].name]=dic[companyid][companyuserid]

              delete dic[companyid][companyuserid]
              // console.log(typeof fileNames[[companyuserid]])
              if (!fileNames[[data_user[0].name]] ){
                fileNames[[data_user[0].name]] =fileNames[companyuserid]
                delete fileNames[companyuserid]
                
                
             
              }
              else{
                delete fileNames[companyuserid]
                
              }
              
             
            }
        }
    }
    // console.log(fileNames)

let tableData={}
for (let companyid of Object.keys(dic)) 
{
  if (tableData[docpercompany[companyid]])
  {
    for (let username of Object.keys(tableData[docpercompany[companyid]])){
     
    tableData[docpercompany[companyid]][username]=tableData[docpercompany[companyid]][username]+dic[companyid][username]
    

    }

  }

else{
    tableData[docpercompany[companyid]]=dic[companyid]

  }


  
}

// console.log(fileNames)
// console.log(fileDict)


try{
main2(companyName,tableData,fileNames,fileDict)
}catch (error) {
  console.log(`main2 function could'nt start because of ${error}`);
}
}catch (error) {
  console.log(error);
}

}
// main()
module.exports=main;
