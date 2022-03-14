require('dotenv').config()
const req = require('express/lib/request');
const {MongoClient, ObjectId } = require('mongodb');
const url =`mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@validateme-dev-mongo-db-vnabo.mongodb.net/Validateme`;
const client = new MongoClient(url);

const database='Validateme'

async function dbconnect()
{try{
    let result = await client.connect();
    db=result.db(database);
    return db
}catch(error){
    console.log(error)
}
    
}

module.exports=dbconnect;