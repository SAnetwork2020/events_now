import express from 'express';
import { validationResult, body } from 'express-validator';
import TokenVerifier from '../middlewares/token';
import { IEvent } from '../models/i_event';
import Event from '../models/events';
import { error } from 'console';

const eventsRouter: express.Router = express.Router();
/* 
@usage: Upload an event
@url: http://127.0.0.1:5000/events/upload
@method: POST
@field: name,image,price,date,info,type
@access: PRIVATE
*/
eventsRouter.post('/upload', [
    body('name').notEmpty().withMessage('Name is Required'),
    body('image').notEmpty().withMessage('Image is Required'),
    body('price').notEmpty().withMessage('Price is Required'),
    body('date').notEmpty().withMessage('Date is Required'),
    body('info').notEmpty().withMessage('Info is Required'),
    body('type').notEmpty().withMessage('Type is Required'),
],
    TokenVerifier, async (req: express.Request, res: express.Response) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(401).json(
                {
                    errors: errors.array(),

                },
            );
        }
        try {
            let { name, image, price, date, info, type } = req.body;

            // check if event with the same name exist
            let event: IEvent | null = await Event.findOne({ name: name });
            if (event) {
                res.status(401).json({
                    errors: [
                        {
                            msg: "Event already exists",
                        },
                    ]
                })
                return;
            }
            event = new Event({ name, image, price, date, info, type });
            event = await event.save();
            res.status(200).json({
                msg: 'Event upload successful',
                event: event,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                errors: [
                    {
                        msg: error
                    }
                ]
            });
            return;
        }
    });

/* 
@usage: Get all Free events
@url: http://127.0.0.1:5000/events/free
@method: GET
@field: no-fields
@access: PUBLIC
 */
eventsRouter.get('/free', async (req: express.Request, res: express.Response) => {
    try {
        let events: IEvent[] | null = await Event.find({ type: 'FREE' });
        if (!events) {
            res.status(400).json({
                errors: [
                    {
                        msg: error,
                    },
                ],
            });
            return;
        }
        res.status(200).json({
            msg: 'List of Free events',
            events: events
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            errors: [
                {
                    msg: error
                }
            ]
        });
    }
});

/* 
@usage: Get all Pro Free Events
@url: http://127.0.0.1:5000/events/pro
@method: GET
@fields: no-fields
@access: PUBLIC
*/
eventsRouter.get('/pro', async (req: express.Request, res: express.Response) => {
    try {
        let events:IEvent[]|null = await Event.find({type:'PRO'});
        if (!events) {
            res.status(400).json({
                errors:[
                    {
                        msg: error,

                    },
                ],
            });
        }
        res.status(200).json({
            msg: 'All Pro Events',
            events:events,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            errors: [
                {
                    msg: error
                }
            ]
        });
    }
});

/* 
@usage: Get Single Event
@url: http://127.0.0.1:5000/events/:eventId
@method: GET
@fields: no-fields
@access: PUBLIC
*/
eventsRouter.get('/:eventId', async (req: express.Request, res: express.Response) => {
    try {
        let { eventId } = req.params;
        let event:IEvent | null = await Event.findById(eventId);
        if (!event) {
            res.status(400).json({
                errors:[
                    {
                        msg: error,
                    },
                ],
            });
            return;
        }
        res.status(200).json({
            msg: "Get Single Event successful",
            event:event,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            errors: [
                {
                    msg: error
                }
            ]
        });
    }
});
export default eventsRouter;