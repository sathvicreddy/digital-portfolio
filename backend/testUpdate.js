const mongoose = require('mongoose');
require('dotenv').config();
const Hero = require('./models/Hero');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');
    const hero = await Hero.findOne();
    if (hero) {
      console.log('Before update:', hero);
      const updated = await Hero.findByIdAndUpdate(
        hero._id,
        { $set: { contactEmail: 'test@example.com', contactPhone: '1234567890' } },
        { new: true }
      );
      console.log('After update:', updated);
    }
    process.exit(0);
  })
  .catch(err => console.error(err));
