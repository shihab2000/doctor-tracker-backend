const router = require('express').Router();
const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { protect } = require('../middleware/auth');
const { pagination, dateRange } = require('../utils/query');
router.use(protect);
router.get('/', async(req,res,next)=>{try{
 const {page,limit,skip}=pagination(req.query); const filter={...dateRange(req.query)};
 if(req.query.condition)filter.condition=req.query.condition;
 if(req.query.doctor) {if(mongoose.isValidObjectId(req.query.doctor))filter.doctor=req.query.doctor;else return res.status(400).json({message:'Invalid doctor filter'});}
 if(req.query.search){const s=escapeRegex(req.query.search.trim().slice(0,100));filter.$or=['name','condition','phone'].map(k=>({[k]:{$regex:s,$options:'i'}}));}
 const [items,total]=await Promise.all([Patient.find(filter).populate('doctor','name specialization hospital').sort({createdAt:-1}).skip(skip).limit(limit).lean(),Patient.countDocuments(filter)]);
 res.json({items,pagination:{page,limit,total,pages:Math.ceil(total/limit)}});
}catch(e){next(e);}});
router.get('/:id',async(req,res,next)=>{try{if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({message:'Invalid patient ID'});const item=await Patient.findById(req.params.id).populate('doctor','name specialization').lean();if(!item)return res.status(404).json({message:'Patient not found'});res.json({item});}catch(e){next(e);}});
router.post('/',async(req,res,next)=>{try{const data=pick(req.body);if(!mongoose.isValidObjectId(data.doctor))return res.status(400).json({message:'A valid doctor is required'});if(!await Doctor.exists({_id:data.doctor}))return res.status(400).json({message:'Selected doctor does not exist'});const item=await Patient.create(data);res.status(201).json({item:await item.populate('doctor','name specialization')});}catch(e){next(e);}});
router.put('/:id',async(req,res,next)=>{try{if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({message:'Invalid patient ID'});const data=pick(req.body);if(data.doctor){if(!mongoose.isValidObjectId(data.doctor)||!await Doctor.exists({_id:data.doctor}))return res.status(400).json({message:'Selected doctor does not exist'});}const item=await Patient.findByIdAndUpdate(req.params.id,data,{new:true,runValidators:true}).populate('doctor','name specialization');if(!item)return res.status(404).json({message:'Patient not found'});res.json({item});}catch(e){next(e);}});
router.delete('/:id',async(req,res,next)=>{try{if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({message:'Invalid patient ID'});const item=await Patient.findByIdAndDelete(req.params.id);if(!item)return res.status(404).json({message:'Patient not found'});res.json({message:'Patient deleted'});}catch(e){next(e);}});
function escapeRegex(s){return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');}
function pick(b){return {name:b.name,age:b.age,gender:b.gender,condition:b.condition,phone:b.phone,doctor:b.doctor};}
module.exports=router;
