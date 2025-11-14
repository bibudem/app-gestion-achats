const Logs = require('../models/home');
const auth = require("../auth/auth");
const Lib = require("../util/lib");

exports.getCount = async (req, res, next) => {
  try {
    const [allChifres] = await Logs.fetchCountBoard();
    //console.log(allChifres)
    res.status(200).json(allChifres);

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getGraphiqueDonnees = async (req, res, next) => {
  try {
    const [objGraphique] = await Logs.getGraphiqueDonnees();
    //console.log(objGraphique)
    //res.status(200).json(objGraphique);
    res.status(200).json(['ok'])

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
