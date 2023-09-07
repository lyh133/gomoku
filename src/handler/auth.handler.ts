import express, { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import validateSchema from '../middleware/validateSchema'
import { createUser, getUserByUsername, getUserById } from '../service/auth.service'
import {
  LoginInput,
  RegisterInput,
  registerSchema,
} from '../schema/auth.schema'
import { signJwt } from '../util/jwt'

const authHandler = express.Router()

let logged_user = new Set<string>([])


const decodeToken = (token: string | undefined): {username: string, _id: string} | undefined => {

  if (!token || !token.startsWith('Bearer ')) {
    return undefined;
  }
  const userToken = token.slice(7);
  const privateKey = process.env.accessTokenPrivateKey as string
  const decodedToken: {username: string, _id: string} = jwt.verify(userToken, privateKey) as {username: string, _id: string};
  return decodedToken
}


authHandler.post(
  '/register',
  validateSchema(registerSchema),
  async (req: Request<{}, {}, RegisterInput['body']>, res: Response) => {
    try {
      const { username, password } = req.body

      // check if user already exist
      // Validate if user exist in our database
      const existingUser = await getUserByUsername(username)

      if (existingUser) {
        return res.status(409).send('User Already Exist. Please Login')
      }

      //Encrypt user password
      const encryptedPassword = await bcrypt.hash(password, 10)

      // Create user in our database
      const newUser = await createUser({
        username,
        password: encryptedPassword,
      })

      // Create token
      const token = signJwt({ username, _id: newUser._id })

      logged_user.add(newUser._id)

      // return new user with token
      res.status(200).json({ _id: newUser._id, token })
    } catch (err) {
      console.log(err)
      return res.status(500).send(err)
    }
  }
)

authHandler.post(
  '/login',
  async (req: Request<{}, {}, LoginInput['body']>, res: Response) => {
    try {
      // Get user input
      const { username, password } = req.body

      // Validate if user exist in our database
      const user = await getUserByUsername(username)

      if (user && (await bcrypt.compare(password, user.password))) {
        // Create token
        const token = signJwt({ username, _id: user._id })


        logged_user.add(user._id)
        // user
        return res.status(200).json({ _id: user._id, token })
      }
      return res.status(400).send('Invalid Credentials')
    } catch (err) {
      return res.status(500).send(err)
    }
  }
)

authHandler.post(
  '/logout',
  async (req: Request<{}, {}, {}>, res: Response) => {
    try {
      const decodedToken = decodeToken(req.headers.authorization);
      if(!decodedToken) return res.status(401).send('Unauthorized');
      
      const user = await getUserById(decodedToken._id)
      if(!user) return res.status(401).send('Unauthorized');

      logged_user.delete(decodedToken._id);
      return res.status(200).send("logout ok")
      
    } catch (err) {
      return res.status(500).send(err);
    }
  }
)


export default authHandler
