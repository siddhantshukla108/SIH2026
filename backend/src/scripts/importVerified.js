require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Course = require('../models/Course');
const Livelihood = require('../models/Livelihood');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please specify MONGODB_URI in .env");
  process.exit(1);
}

const importData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for data import...");

    // Read and import Courses
    const coursesPath = path.join(__dirname, '../../data/verified/courses.json');
    if (fs.existsSync(coursesPath)) {
      const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
      // Using Title or some unique identifier for update
      for (const item of coursesData) {
        // Enforce isDemo based on verification
        if (!item.verified) {
          item.isDemo = true;
        }
        await Course.findOneAndUpdate({ title: item.title }, item, { upsert: true, new: true });
      }
      console.log(`Imported ${coursesData.length} courses.`);
    }

    // Read and import Livelihoods
    const livelihoodsPath = path.join(__dirname, '../../data/verified/livelihoods.json');
    if (fs.existsSync(livelihoodsPath)) {
      const livelihoodsData = JSON.parse(fs.readFileSync(livelihoodsPath, 'utf8'));
      for (const item of livelihoodsData) {
        if (!item.verified) {
          item.isDemo = true;
        }
        await Livelihood.findOneAndUpdate({ title: item.title }, item, { upsert: true, new: true });
      }
      console.log(`Imported ${livelihoodsData.length} livelihoods.`);
    }

    console.log("Data import complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error importing data:", error);
    process.exit(1);
  }
};

importData();
