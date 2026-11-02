import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins"
const client = new MongoClient(process.env.MONGODB_URL as string);
const db = client.db("StudioSpace");



export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    
    minPasswordLength: 6,
  },
  
 socialProviders: {
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
     
  database: mongodbAdapter(db, {
    client,
    
  }),
  plugins: [jwt()],
  session: {
    cookieCache: {
      enabled: true,
      strategy: 'jwt',
      maxAge: 7 * 24 * 60 * 60 
    }
  }
   

});