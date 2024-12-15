import express from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";
const app = express();
const port = process.env.PORT || 3001;

//enable cors
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// use json
app.use(express.json());


// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });

const alreadyGivenEasyThings = [];
const alreadyGivenMediumThings = [];
const alreadyGivenHardThings = [];

app.get('/easy', async (req, res) => {
  try{
    const result = await model.generateContent([
      `Give some things that can be drawn simply by using mouse on a white board. Give simple not too hard to draw. Dont not repeat the things you have already given. Just give one thing. In the below format and do not print anything else:
  
      Thing: {your thing}
  
      Things that you have already given:
      {${alreadyGivenEasyThings.join(',')}}
      `
    ])
  
    const thing = result.response.text().split('Thing: ')[1].split('\n')[0].replace(/[^a-zA-Z0-9 ]/g, '');
    alreadyGivenEasyThings.push(thing);
    res.send({ thing });
  }catch(err){
    res.status(429).send("Try Again Later");
  }
})

app.get('/medium', async (req, res) => {
  try{
  const result = await model.generateContent([
    `Give some things that can be drawn simply by using mouse on a white board. Give medium level thing neither too hard nor too easy to draw. Dont not repeat the things you have already given. Just give one thing. In the below format and do not print anything else:

    Thing: {your thing}

    Things that you have already given:
    {${alreadyGivenMediumThings.join(',')}}
    `
  ])

  const thing = result.response.text().split('Thing: ')[1].split('\n')[0].replace(/[^a-zA-Z0-9 ]/g, '');
    alreadyGivenMediumThings.push(thing);
    res.send({ thing });
  }catch(err){
    res.status(429).send("Try Again Later");
  }
})

app.get('/hard', async (req, res) => {
  try{
    const result = await model.generateContent([
      `Give some things that can be drawn simply by using mouse on a white board. Give hard level thing that is not easy to draw. Dont not repeat the things you have already given. Just give one thing. In the below format and do not print anything else:

      Thing: {your thing}

      Things that you have already given:
      {${alreadyGivenHardThings.join(',')}}
      `
    ])

    const thing = result.response.text().split('Thing: ')[1].split('\n')[0].replace(/[^a-zA-Z0-9 ]/g, '');
    alreadyGivenHardThings.push(thing);
    res.send({ thing });

  }catch(err){
    res.status(429).send("Try Again Later");
  }
})

app.post('/check', async (req, res) => {
  const dataURL = req.body.dataURL;
  const thing = req.body.thing;
  const result = await model.generateContent([
    {
        inlineData: {
            data: dataURL.split(';base64,')[1],
            mimeType: "image/jpeg",
        },
    },
    `Is it a sketch of a ${thing}? just answer "yes" or "no."`,
]);
const response = result.response.text()
if (response.toLowerCase().includes('yes')) {
  res.send(true);
} else {
  res.send(false);
}
})


app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})