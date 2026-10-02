const Model = require("../models/Category"),
  crud = require("./crudService").make(Model, {
    populate: [{ path: "parent", select: "name nameEn slug" }],
  });
module.exports = crud;
