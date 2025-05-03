import express from 'express';
import { body, validationResult } from 'express-validator';
import { IUser } from '../models/i_user';
import User from '../models/user';
import bcrypt from 'bcryptjs';
import gravatar from 'gravatar';
import jwt from 'jsonwebtoken';
import TokenVerifier from '../middlewares/token';
import { error } from 'console';

const userRouter: express.Router = express.Router();

/* 
@usage: Register a user
@url: http://127.0.0.1:5000/users/register
@method: POST
@fields: name, email, password
@access: PUBLIC
*/
userRouter.post('/register', [
    body('name').notEmpty().withMessage("Name is Required"),
    body('email').isEmail().withMessage("Email is Required"),
    body('password').isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
], async (req: express.Request, res: express.Response) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            errors: errors.array(),
        });
        return;
    }
    try {
        let { name, email, password } = req.body;
        // check if the email exists
        let user: IUser | null = await User.findOne({ email: email });
        if (user) {
            res.status(400).json({
                errors: [
                    {
                        msg: "User Already Exist"
                    }
                ]
            });
        };

        // encrypt the password
        let salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);

        // get avartar url
        let avatar = gravatar.url(email, {
            s: '300',
            r: 'pg',
            d: 'mm'
        });

        // register the user
        user = new User({ name, email, password, avatar });
        user = await user.save();


        res.status(200).json({
            msg: 'Registration is successful'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            errors: [
                {
                    msg: error,
                }
            ]
        });
    }
});


/* 
@usage: Login a user
@url: http://127.0.0.1:5000/users/login
@method: POST
@fields: email, password
@access: PUBLIC
*/
userRouter.post('/login', [
    body('email').notEmpty().withMessage("Email is Required"),
    body('password').isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
], async (req: express.Request, res: express.Response) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            errors: [
                {
                    msg: errors.array(),
                }
            ]
        });
        return;
    }
    try {
        let { email, password } = req.body;

        // check for email
        let user: IUser | null = await User.findOne({ email: email });
        if (!user) {
            res.status(401).json({
                errors: [
                    {
                        msg: "Invalid Email"
                    }
                ]
            });
            return;
        }

        // check for password
        let isMatch: boolean = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({
                errors: [
                    {
                        msg: "Invalid Password"
                    }
                ]
            });
            return;
        }

        // create a token
        let payload: any = {
            user: {
                id: user.id,
                name: user.name
            }
        };
        let secretKey: string | undefined = process.env.JWT_SECRET_KEY;
        if (secretKey) {
            let token = jwt.sign(payload, secretKey);
            res.status(200).json({
                msg: "Login successful",
                token: token,
            });
            return;
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({
            errors: [
                {
                    msg: error,
                }
            ]
        });
    }
});

/* 
@usage: Get user info
@url: http://127.0.0.1:5000/users/me
@method: GET
@fields: null
@access: PRIVATE
 */
userRouter.get('/me', TokenVerifier, async (req: express.Request, res: express.Response) => {
    try {
        // TODO Get a user logic
        // let requestedUser: any = req.headers['user'];
        const requestedUser: any = (req as any).user;
        if (!requestedUser || !requestedUser.id) {
            res.status(400).json({
                errors: [
                    {
                        msg: "User ID is missing or invalid in the token"
                    },
                ],
            });
        }

        // Fetch user from the database
        const user: IUser | null = await User.findById(requestedUser.id).select('-password');
        // let user:IUser | null = await User.findOne({_id:requestedUser.id});
        if (!user) {
            res.status(400).json({
                errors: [
                    {
                        msg: "User data not found!"
                    },
                ],
            });
            return
        }
        res.status(200).json({
            user: user
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            errors: [
                {
                    msg: error,
                }
            ]
        });
    }
});

export default userRouter;