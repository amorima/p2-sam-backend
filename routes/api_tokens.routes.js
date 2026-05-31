import express from 'express'
import { verifyJWT } from '../middleware/auth.middleware.js'
import * as ctrl from '../controllers/api_tokens.controllers.js'

const router = express.Router()

router.get('/', verifyJWT, ctrl.listTokens)
router.post('/', verifyJWT, ctrl.createToken)
router.delete('/:id', verifyJWT, ctrl.revokeToken)

export default router
