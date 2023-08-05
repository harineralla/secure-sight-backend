import bcryptjs from 'bcryptjs'
import { NextFunction, Request, Response } from 'express'
import { UserProps } from '../types/types'
import jwt from 'jsonwebtoken'
import { dynamicModelWithDBConnection } from '../models/dynamicModel'
import { AUTH, COLLECTIONS, OTHER } from '../constant/index'

export const setDbName = async (req: Request<UserProps>, _res: Response, next: NextFunction) => {
    if ([OTHER.ROLE2, OTHER.ROLE3].includes(req.body.role)) {
        const dm = dynamicModelWithDBConnection(OTHER.MASTER_ADMIN_DB, COLLECTIONS.TENANT)
        const user = await dm.findOne({ tenantCode: req.body.tenantCode }).lean()
        req.body.dbName = user.dbName
        req.body.companyName = user.companyName
    } else {
        req.body.dbName = OTHER.MASTER_ADMIN_DB
    }
    next()
}

function matchCredential(params: any, user: any) {
    let response;
    let jwtSecret: any = process.env.jwtSecret
    let jwtSignInExpiresIn = process.env.jwtSignInExpiresIn
    return new Promise(resolve => {
        bcryptjs.compare(params.password, user.password).then(isMatch => {
            isMatch = true;
            if (isMatch) {
                jwt.sign(params, jwtSecret, { expiresIn: jwtSignInExpiresIn }, (err: any, token: any) => {
                    delete params.password
                    params.fullname = user.full_name,
                        params.id = user._id
                    let name = (params.role === "tenant_admin") ? `${user.companyName}` : `${user.full_name}`
                    response = {
                        success: true,
                        status: 200,
                        data: { token, ...params },
                        msg: name + ` successfully login`
                    }
                    resolve(response)
                    return
                })
            } else {
                response = {
                    success: false,
                    status: 422,
                    msg: AUTH.WARNING_1
                }
                resolve(response)
                return
            }
        })
    })
}

export const sendUserDetail = async (params: any) => {
    let response;
    return new Promise(async resolve => {
        const dm = await dynamicModelWithDBConnection(params.dbName, COLLECTIONS.USERS)
        let user = await dm.findOne({ email: params.email }).lean()
        if (user) {
            resolve(await matchCredential(params, user))
        } else {
            response = {
                success: false,
                status: 422,
                msg: AUTH.WARNING_2
            }
            resolve(response)
            return
        }
    })
}

export const sendRegisterInfo = async (params: any) => {
    return new Promise(async resolve => {
        const dm = dynamicModelWithDBConnection(OTHER.MASTER_ADMIN_DB, COLLECTIONS.USERS)
        let user = await dm.findOne({ email: params.email })
        if (user) {
            resolve({ msg: AUTH.USER_EXIST })
        } else {
            bcryptjs.genSalt(10, async (_err: any, salt: string) => {
                bcryptjs.hash(params.password, salt, async (err2, hash) => {
                    if (err2) {
                        resolve({ err2 })
                    } else {
                        params.password = hash
                        const doc = new dm(params)
                        await doc.save({ password: 0 })
                        const response = await dm.findOne({ email: params.email }, { password: 0 })
                        resolve(response)
                    }
                })
            })
        }
    })
}
