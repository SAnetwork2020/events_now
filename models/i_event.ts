import mongoose,{Document} from "mongoose";
export interface IEvent extends Document{
    // _id?:string;
    name:string;
    image:string;
    price:string;
    date:string;
    info:string;
    type:string;
    createdAt?:Date;
    updatedAt?:Date;
}
