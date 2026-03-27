const express = require("express");
const {approveSeller , rejectSeller , getAllSeller , getAllCustomer, getUser, getAllUser} = require("../controller/admin.controller");
const {protect} = require("../middleware/protectedRoute");
const {adminProtectRoute} = require("../middleware/adminProtectRoute");

const adminRouter = express.Router();

adminRouter.post("/approveSeller/:id" , protect , adminProtectRoute, approveSeller); // working
adminRouter.post("/rejectSeller/:id" , protect, adminProtectRoute , rejectSeller); // working
adminRouter.get("/getAllSeller" , protect , adminProtectRoute, getAllSeller); // working
adminRouter.get("/getAllCustomer" , protect , adminProtectRoute , getAllCustomer); // working
adminRouter.get("/getAllUser" , protect , adminProtectRoute , getAllUser) // working
adminRouter.get("/getUser/:id" , protect , adminProtectRoute , getUser) // working

module.exports = adminRouter;