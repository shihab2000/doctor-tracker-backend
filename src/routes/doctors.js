const router = require('express').Router();
const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { protect } = require('../middleware/auth');
const { pagination, dateRange } = require('../utils/query');
router.use(protect);
router.get('/', async (req, res, next) => {
 try {
  const { page, limit, skip } = pagination(req.query); const filter = { ...dateRange(req.query) };
  if (req.query.specialization) filter.specialization = req.query.specialization;
  if (req.query.search) { const s = req.query.search.trim().slice(0,100); filter.$or = ['name','specialization','hospital','email','phone'].map(k => ({ [k]: { $regex: escapeRegex(s), $options: 'i' } })); }
  const [items,total] = await Promise.all([Doctor.find(filter).sort({createdAt:-1}).skip(skip).limit(limit).lean(), Doctor.countDocuments(filter)]);
  res.json({ items, pagination: { page, limit, total, pages: Math.ceil(total/limit) } });
 } catch(e) { next(e); }
});
router.get('/:id/patients', async (req,res,next)=>{ try { if(!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({message:'Invalid doctor ID'}); const patients=await Patient.find({doctor:req.params.id}).sort({createdAt:-1}).lean(); res.json({items:patients}); } catch(e){next(e);} });
router.get('/:id', async(req,res,next)=>{try{if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({message:'Invalid doctor ID'});const item=await Doctor.findById(req.params.id).lean();if(!item)return res.status(404).json({message:'Doctor not found'});res.json({item});}catch(e){next(e);}});
router.post('/', async(req,res,next)=>{try{const data=pick(req.body);const item=await Doctor.create(data);res.status(201).json({item});}catch(e){next(e);}});
router.put('/:id', async(req,res,next)=>{try{if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({message:'Invalid doctor ID'});const item=await Doctor.findByIdAndUpdate(req.params.id,pick(req.body),{new:true,runValidators:true});if(!item)return res.status(404).json({message:'Doctor not found'});res.json({item});}catch(e){next(e);}});
router.delete('/:id', async(req,res,next)=>{try{if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({message:'Invalid doctor ID'});const count=await Patient.countDocuments({doctor:req.params.id});if(count)return res.status(409).json({message:'This doctor has patients. Reassign or delete their patients first.'});const item=await Doctor.findByIdAndDelete(req.params.id);if(!item)return res.status(404).json({message:'Doctor not found'});res.json({message:'Doctor deleted'});}catch(e){next(e);}});
function escapeRegex(s){return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');}
function pick(b){return {name:b.name,specialization:b.specialization,hospital:b.hospital,phone:b.phone,email:b.email};}
module.exports=router;
