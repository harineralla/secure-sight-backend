import express, { Request, Response } from 'express'
import passport from 'passport'
const router = express.Router();
import { UserProps } from '../types/types'
import AuthController from '../controllers/authController'
import { setDbName } from '../utils/auth-util'
import { CompareDate } from '../middleware/auth'

router.post('/register', async (req: Request<UserProps>, res: Response) => {
    let data = await AuthController.register(req.body)
    res.send(data)
})

router.post('/login',CompareDate, setDbName, async (req: Request<UserProps>, res: Response) => {
    let data = await AuthController.login(req.body)
    res.send(data)
})

router.post('/info', passport.authenticate('jwt', { session: false }), async (req: Request, res: Response) => {
    res.send(req.user)
})

router.post('/generate-license-key', async (req: Request<UserProps>, res: Response) => {
    let data = await AuthController.licenseKey(req.body)
    res.send(data)
})

export default router;