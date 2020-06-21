#!/usr/bin/env node
const axios = require('axios');

dataGetter();

//Get inmate list
async function dataGetter(){
  //Get inmate list
  const d = new Date();
  const n = d.getTime();
  const allInmateURL= 'https://inmatesearch.linncounty.org/Home/GetTableData?_='+n;

  async function makeGetRequest() {

    let res = await axios.get(allInmateURL);
    let data = res.data.data;
    return(data);
  }
  
  allInmates= await makeGetRequest();
  filterInmates(allInmates);
};

async function filterInmates(allInmatesList) {

  const callPromises = allInmatesList.map(i => {
       const date = new Date();
        const time = date.getTime();
        const inmateURL = 'https://inmatesearch.linncounty.org/BookingDetails/GetTableData?bookID='+i.BOOK_ID+'&_='+time;

      return axios.get(inmateURL)
      .then(response => {
        let thisInmate = {...i, ...response.data};
       return thisInmate;
      })
        .catch(
        function (error) {
          console.log('error')
          return Promise.reject(error)
        }
      );
  });

  const results = await Promise.all(callPromises);

  const iceInmates = results.filter(r=>{
    let iceInmate = r.data.some(({CHRGDESC})=>
    CHRGDESC == "HOLD - IMMIGRATION AND CUSTOMS ENFORCEMENT"|| CHRGDESC == "HOLD INS DETAINER");
    return iceInmate;
  })
  .sort((a,b) => (a.BOOK_ID < b.BOOK_ID)? 1 : -1);
  console.table(iceInmates);

  iceInmates.forEach((d, i) =>{
    console.log("index "+i, " Name: "+d.FULLNAME)
    d.data.forEach(dataObj=>{
      console.table(dataObj);
      });
  });
};
