const axios = require('axios');
const fs = require('fs')

const num_mints = 3600;
let traits = []

/* this is horrible but kept getting connection refused when trying to spread using Promise.all / Axios.all */
async function scrape() {
    for (let i = 1; i < num_mints+1; i++) {
        console.log(i)
        await axios.get(`https://racecar.mypinata.cloud/ipfs/QmWU2C7Le35uBCBbqU7tZdpTw2Y41W9o7b1K65GKn9mJkC/${i}.json`)
            .then(p => {
                traits.push(p.data);
            })
    }
}

async function process() {
    await scrape();
    fs.writeFile('scraped.txt', JSON.stringify(traits), { flag: 'a+' }, err => {
        if (err) {
            console.error(err)
            return
        }
    })
}

async function run() {
    await process();

    fs.readFile('scraped.txt', 'utf8' , (err, data) => {
        if (err) {
          console.error(err)
          return
        }
        
        traits = JSON.parse(data)
    
        traits.forEach(t => {
            let bg = t.attributes.find(obj => { return obj.trait_type === 'Background' })
            let legs = t.attributes.find(obj => { return obj.trait_type === 'Legs' })
            let body = t.attributes.find(obj => { return obj.trait_type === 'Body' })
            let wrists = t.attributes.find(obj => { return obj.trait_type === 'Wrists' })
            let arms = t.attributes.find(obj => { return obj.trait_type === 'Arms' })
            let head = t.attributes.find(obj => { return obj.trait_type === 'Head' })
            let hands = t.attributes.find(obj => { return obj.trait_type === 'Hands' })
            
            let content = `(${t.tokenId},'${bg.value}','${legs.value}','${body.value}','${wrists.value}','${arms.value}','${head.value}','${hands.value}',),\n`
            fs.writeFile('sql.txt', content, { flag: 'a+' }, err => {
                if (err) {
                    console.error(err)
                    return
                }
                //file written successfully
            })
        })    
    })
}

run();