'use client';

import React, { useState } from 'react';
import {
   Mail,
   Phone,
   MapPin,
   Clock,
   Send,
   Headset,
   MessageSquare,
   Rocket,
   Facebook,
   Twitter,
   Instagram,
   Youtube,
   Linkedin,
   CircleCheck,
   CircleAlert,
   Sparkles,
   Link2,
   GraduationCap,
   ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import MobileAppWrapper from '../MobileAppWrapper';
import Card from '../ui/Card';
import Button from '../ui/Button';

const ContactUs = ({ contactInfo = {
   email: 'support@mohdsazidkhan.com',
   phone: '+91 7678 13 1912',
   address: 'Badarpur, Delhi, India',
   businessHours: 'Mon - Fri: 9:00 AM - 9:00 PM'
} }) => {
   const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
   const [status, setStatus] = useState(null);
   const [loading, setLoading] = useState(false);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setStatus(null);
      try {
         const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
         const response = await fetch(`${API_BASE_URL}/api/contacts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               name: formData.name,
               email: formData.email,
               message: `Subject: ${formData.subject}\n${formData.message}`,
            }),
         });
         const data = await response.json();
         if (data.success) {
            setStatus("success");
            setFormData({ name: "", email: "", subject: "", message: "" });
         } else { setStatus("error"); }
      } catch (error) { setStatus("error"); }
      finally { setLoading(false); }
   };

   const socialLinks = [
      { icon: Facebook, url: process.env.NEXT_PUBLIC_FACEBOOK_URL, color: 'blue-600' },
      { icon: Twitter, url: process.env.NEXT_PUBLIC_TWITTER_URL, color: 'sky-500' },
      { icon: Instagram, url: process.env.NEXT_PUBLIC_INSTAGRAM_URL, color: 'pink-600' },
      { icon: Youtube, url: process.env.NEXT_PUBLIC_YOUTUBE_URL, color: 'red-600' },
   ];

   return (
      <MobileAppWrapper title="Contact Support">
         <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 animate-fade-in selection:bg-primary-500 selection:text-white font-outfit mt-0">
            <div className="container mx-auto px-4 lg:px-10 py-10 lg:py-20 space-y-12 lg:space-y-20">

               {/* --- Header Section --- */}
               <section className="text-center space-y-6 relative overflow-hidden">
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-24 h-24 bg-primary-500 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-duo-primary border-4 border-white/10 rotate-12">
                     <MessageSquare className="w-10 h-10" />
                  </motion.div>
                  <div className="space-y-4">
                     <h1 className="text-2xl lg:text-4xl font-black font-outfit uppercase tracking-tighter text-slate-900 dark:text-white">Contact <span className="text-primary-500">Support</span></h1>
                     <p className="text-sm lg:text-base font-bold text-slate-600 dark:text-slate-400 uppercase tracking-[0.3em] max-w-2xl mx-auto px-4">Have a question or problem? Talk to us. We are happy to help you.</p>
                  </div>
               </section>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

                  {/* --- Contact Details --- */}
                  <div className="lg:col-span-6 space-y-8">
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {[
                           { label: 'Email Support', val: contactInfo.email, icon: Mail, color: 'primary' },
                           { label: 'Phone Number', val: contactInfo.phone, icon: Phone, color: 'secondary' },
                           { label: 'Office Address', val: contactInfo.address, icon: MapPin, color: 'blue' },
                           { label: 'Working Hours', val: contactInfo.businessHours, icon: Clock, color: 'orange' }
                        ].map((item, i) => (
                           <Card key={i} className="p-6 lg:p-8 flex items-center gap-6 lg:gap-10 border-2 border-slate-200/60 dark:border-slate-800 hover:border-primary-500/30 transition-all rounded-[2rem] lg:rounded-[3rem] bg-white dark:bg-slate-900/40 group">
                              <div className={`w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center bg-${item.color === 'primary' ? 'primary-500' : item.color + '-500'}/25 text-${item.color === 'primary' ? 'primary' : item.color}-500 rounded-xl lg:rounded-2xl border-2 border-transparent group-hover:border-current transition-all shrink-0`}>
                                 <item.icon className="w-5 h-5 lg:w-6 lg:h-6" />
                              </div>
                              <div className="min-w-0">
                                 <p className="text-[9px] lg:text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-[0.2em] leading-none mb-1.5 lg:mb-2">{item.label}</p>
                                 <p className="text-sm lg:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{item.val}</p>
                              </div>
                           </Card>
                        ))}
                     </div>

                     {/* Social Links */}
                     <Card className="p-8 space-y-6 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 overflow-hidden relative rounded-[3rem] shadow-sm">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                        <div className="relative z-10 space-y-6">
                           <div className="space-y-1">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-600 dark:text-primary-400">Follow Us</h4>
                              <p className="text-xl font-black font-outfit uppercase tracking-tighter text-slate-900 dark:text-white">Find Us on Social Media</p>
                           </div>
                           <div className="flex flex-wrap gap-4">
                              {socialLinks.map((s, i) => (
                                 <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-white dark:bg-slate-800 hover:bg-primary-500 hover:text-white dark:hover:text-white flex items-center justify-center rounded-xl transition-all border-2 border-slate-200 dark:border-slate-700 shadow-sm text-slate-600 dark:text-slate-400 group/link">
                                    <s.icon className="w-5 h-5 group-hover/link:scale-110 transition-transform" />
                                 </a>
                              ))}
                           </div>
                        </div>
                        <Sparkles className="absolute -bottom-10 -right-10 w-24 lg:w-48 h-24 lg:h-48 text-white/5 -rotate-12" />
                     </Card>

                     {/* Support Info */}
                     <Card className="p-8 border-none bg-gradient-to-br from-primary-500 via-indigo-600 to-primary-600 text-white shadow-duo-secondary rounded-[3rem] overflow-hidden group relative">
                        <div className="flex items-center gap-5 relative z-10">
                           <div className="w-14 h-14 bg-white/20 rounded-2xl backdrop-blur-md border-2 border-white/20 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 shadow-lg">
                              <Headset className="w-8 h-8" />
                           </div>
                           <div className="space-y-1">
                              <h4 className="text-xl font-black font-outfit uppercase tracking-tight leading-none">We Are Here For You</h4>
                              <p className="text-xs font-bold opacity-80 uppercase tracking-[0.1em]">Students always come first. We are ready to help.</p>
                           </div>
                        </div>
                        <Sparkles className="absolute top-0 right-0 w-20 lg:w-32 h-20 lg:h-32 text-white/10 pointer-events-none" />
                     </Card>
                  </div>

                  {/* --- Contact Form --- */}
                  <div className="lg:col-span-6">
                     <Card className="p-6 lg:p-8 space-y-8 border-2 border-b-[12px] border-slate-200/80 dark:border-slate-800 shadow-2xl rounded-[3rem] lg:rounded-[4.5rem] bg-white dark:bg-slate-900/60 backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[80px] -ml-32 -mt-32" />

                        <div className="space-y-6 relative z-10">
                           <h3 className="text-2xl lg:text-xl md:text-2xl lg:text-4xl font-black font-outfit uppercase tracking-tighter text-slate-900 dark:text-white">Send a Message</h3>
                           <p className="text-xs lg:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">We usually reply within 24 hours. Write to us anytime.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              <div className="space-y-4">
                                 <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.3em] px-2 block">Your Full Name</label>
                                 <input
                                    className="w-full px-6 py-5 rounded-[1.5rem] border-2 border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-slate-900 dark:text-white outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 autofill:shadow-[0_0_0_1000px_#020617_inset] autofill:[-webkit-text-fill-color:white]"
                                    placeholder="e.g. John Doe"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required
                                 />
                              </div>
                              <div className="space-y-4">
                                 <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.3em] px-2 block">Email Address</label>
                                 <input
                                    type="email"
                                    className="w-full px-6 py-5 rounded-[1.5rem] border-2 border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-slate-900 dark:text-white outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 autofill:shadow-[0_0_0_1000px_#020617_inset] autofill:[-webkit-text-fill-color:white]"
                                    placeholder="john@example.com"
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required
                                 />
                              </div>
                           </div>

                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.3em] px-2 block">Subject</label>
                              <input
                                 className="w-full px-6 py-5 rounded-[1.5rem] border-2 border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-slate-900 dark:text-white outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 autofill:shadow-[0_0_0_1000px_#020617_inset] autofill:[-webkit-text-fill-color:white]"
                                 placeholder="How can we help?"
                                 value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} required
                              />
                           </div>

                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.3em] px-2 block">Your Message</label>
                              <textarea
                                 rows="5"
                                 className="w-full px-6 py-5 rounded-[1.5rem] border-2 border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-slate-900 dark:text-white outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600 autofill:shadow-[0_0_0_1000px_#020617_inset] autofill:[-webkit-text-fill-color:white]"
                                 placeholder="Type your message here..."
                                 value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} required
                              />
                           </div>

                           <AnimatePresence>
                              {status === 'success' && (
                                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-500/25 text-emerald-600 rounded-2xl border-2 border-emerald-500/20 flex items-center gap-3">
                                    <CircleCheck className="w-5 h-5" />
                                    <span className="text-xs font-black uppercase tracking-widest">Message Sent Successfully!</span>
                                 </motion.div>
                              )}
                              {status === 'error' && (
                                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-500/25 text-red-500 rounded-2xl border-2 border-red-500/20 flex items-center gap-3">
                                    <CircleAlert className="w-5 h-5" />
                                    <span className="text-xs font-black uppercase tracking-widest">Error sending message. Please try again.</span>
                                 </motion.div>
                              )}
                           </AnimatePresence>

                           <Button
                              variant="primary"
                              fullWidth
                              className="bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-base lg:text-lg shadow-duo-primary border-b-[8px] active:border-b-0 border-primary-700 active:translate-y-1 transition-all flex items-center justify-center gap-4 backdrop-blur-sm"
                              type="submit"
                              disabled={loading}
                           >
                              {loading ? 'SENDING...' : (
                                 <div className='flex items-center gap-2'>
                                    <Send className="w-5 h-5" /> SEND MESSAGE
                                 </div>
                              )}
                           </Button>
                        </form>
                     </Card>
                  </div>
               </div>

               {/* --- Feature Grid --- */}
               <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
                  {[
                     { title: 'Fast Reply', desc: 'We reply to your question within 24 hours on working days.', icon: Rocket, color: 'primary' },
                     { title: 'Always Available', desc: 'You can contact us any time. We are here to help.', icon: ShieldCheck, color: 'secondary' },
                     { title: 'Helpful Team', desc: 'Our team knows the platform well and can solve your problem quickly.', icon: GraduationCap, color: 'blue' }
                  ].map((f, i) => (
                     <Card key={i} className="p-6 lg:p-8 text-center space-y-5 border-2 border-slate-200/60 dark:border-slate-800 rounded-[2.5rem] bg-white dark:bg-slate-950/40 hover:shadow-xl transition-all group relative overflow-hidden">
                        <div className={`p-4 bg-${f.color === 'primary' ? 'primary' : f.color}-500/25 text-${f.color === 'primary' ? 'primary' : f.color}-500 rounded-2xl w-fit mx-auto border-2 border-transparent group-hover:border-current transition-all shadow-sm`}>
                           <f.icon className="w-6 h-6" />
                        </div>
                        <div className="space-y-3">
                           <h4 className="text-lg font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white leading-none">{f.title}</h4>
                           <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto">{f.desc}</p>
                        </div>
                     </Card>
                  ))}
               </section>
            </div>
         </div>
      </MobileAppWrapper>
   );
};

export default ContactUs;






