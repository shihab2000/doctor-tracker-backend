const router=require('express').Router();
const Doctor=require('../models/Doctor');const Patient=require('../models/Patient');const {protect}=require('../middleware/auth');
router.use(protect);
router.get('/stats',async(req,res,next)=>{try{
 const [totalDoctors,totalPatients,perDoctor,monthly]=await Promise.all([
 Doctor.countDocuments(),Patient.countDocuments(),
 Patient.aggregate([{$group:{_id:'$doctor',count:{$sum:1}}},{$lookup:{from:'doctors',localField:'_id',foreignField:'_id',as:'doctor'}},{$unwind:{path:'$doctor',preserveNullAndEmptyArrays:true}},{$project:{_id:0,doctorId:'$_id',name:{$ifNull:['$doctor.name','Unknown']},specialization:'$doctor.specialization',count:1}},{$sort:{count:-1}},{$limit:8}]),
 Patient.aggregate([{$match:{createdAt:{$gte:new Date(Date.now()-29*24*60*60*1000)}}},{$group:{_id:{$dateToString:{format:'%Y-%m-%d',date:'$createdAt'}},patients:{$sum:1}}},{$sort:{_id:1}}])
 ]);
 res.json({totalDoctors,totalPatients,patientsPerDoctor:perDoctor,patientsByDate:monthly});
}catch(e){next(e);}});
module.exports=router;
