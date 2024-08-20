const express = require('express')
const router = express.Router()

const { GetAllUsers, GetUser, PatchProfile, PatchPassword } = require('../controllers/Users')

router.get("/", GetAllUsers);
router.get("/:_id", GetUser);
router.patch("/:_id", PatchProfile);
router.patch("/:_id/password", PatchPassword);

module.exports = router