import {  Request, Response, NextFunction } from 'express';


export default function requestLogger(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip; 
    const method = req.method; 
    const path = req.originalUrl; 
    const userAgent = req.get('user-agent'); 
    const timestamp = new Date().toISOString(); 

    console.log(`✅ [${method} - ${path}] - [${timestamp}] - [${ip}] - [${userAgent}]`);
    next();
  }