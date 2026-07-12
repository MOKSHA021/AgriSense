const ChosenCrop = require("../models/ChosenCrop");

const CROP_THRESHOLD = 15;

const recordCropChoice = async (userId, crop, district) => {
  const normDistrict = district.trim().toLowerCase();
  
  const counts = await ChosenCrop.countDocuments({ district: normDistrict, crop });
  if (counts >= CROP_THRESHOLD) {
    const err = new Error(`Overproduction Alert: The threshold limit of ${CROP_THRESHOLD} selections for ${crop} has already been reached in ${district}. Please choose a different crop.`);
    err.status = 400;
    throw err;
  }

  const choice = await ChosenCrop.findOneAndUpdate(
    { user: userId },
    { crop, district: normDistrict },
    { new: true, upsert: true }
  );
  
  return choice;
};

const getDistrictCounts = async (district) => {
  const normDistrict = district.trim().toLowerCase();
  const counts = await ChosenCrop.aggregate([
    { $match: { district: normDistrict } },
    { $group: { _id: "$crop", count: { $sum: 1 } } }
  ]);

  const countsMap = {};
  counts.forEach((item) => {
    countsMap[item._id] = item.count;
  });

  return { district: normDistrict, counts: countsMap, threshold: CROP_THRESHOLD };
};

const getUserChoice = async (userId) => {
  const choice = await ChosenCrop.findOne({ user: userId });
  return choice;
};

module.exports = {
  recordCropChoice,
  getDistrictCounts,
  getUserChoice
};
