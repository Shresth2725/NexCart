const express = require("express");
const {approveSeller , rejectSeller , getAllSeller , getAllCustomer} = require("../controller/admin.controller");

const adminRouter = express.Router();

adminRouter.post("/approveSeller" , approveSeller)
adminRouter.post("/rejectSeller" , rejectSeller)
adminRouter.get("/getAllSeller" , getAllSeller)
adminRouter.get("/getAllCustomer" , getAllCustomer)

module.exports = adminRouter;