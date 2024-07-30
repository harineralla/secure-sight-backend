"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const dynamicModel_1 = require("../models/dynamicModel");
const constant_1 = require("../constant");
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.jwtSecret;
module.exports = (passport) => {
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => __awaiter(void 0, void 0, void 0, function* () {
        const dm = yield (0, dynamicModel_1.dynamicModelWithDBConnection)("secure-sight", constant_1.COLLECTIONS.USERS);
        // const dm = await dynamicModelWithDBConnection("orion", COLLECTIONS.USERS)
        const user = yield dm.findOne({ email: jwt_payload.email }, { password: 0 }).lean();
        return user ? done(null, user) : done(null, false);
    })));
};
