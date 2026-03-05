require('dotenv').config();
const mongoose = require('mongoose');
const TechnicalProblem = require('./models/TechnicalProblem');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const problems = await TechnicalProblem.find({}, 'title difficulty category');
  console.log('Total problems:', problems.length);
  console.log('\nProblems list:');
  problems.forEach((p, i) => {
    console.log(`${i + 1}. [${p.difficulty.toUpperCase()}] ${p.title} (${p.category})`);
  });
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
