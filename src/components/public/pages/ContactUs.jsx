'use client';

import PageHero from '@/components/common/ui/PageHero';
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
import { m as motion, AnimatePresence } from 'framer-motion';
import { FaPinterest } from 'react-icons/fa';

import MobileAppWrapper from '../../common/MobileAppWrapper';
import Card from '../../common/ui/Card';
import Button from '../../common/ui/Button';
import config from '../../../lib/config/appConfig';
import useTranslate from '../../../hooks/useTranslate';

const ContactUs = ({ contactInfo = {
   email: config.CONTACT.EMAIL,
   phone: config.CONTACT.PHONE,
   address: 'Badarpur, Delhi, India',
   businessHours: '24/7'
} }) => {
  const { translate, rich } = useTranslate();
   const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
   const [status, setStatus] = useState(null);
   const [loading, setLoading] = useState(false);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setStatus(null);
      try {
         const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
         const response = await fetch(`${API_BASE_URL}/contacts`, {
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
      { name: 'Instagram', icon: Instagram, url: process.env.NEXT_PUBLIC_INSTAGRAM_URL, color: 'pink-600' },
      { name: 'Facebook', icon: Facebook, url: process.env.NEXT_PUBLIC_FACEBOOK_URL, color: 'blue-600' },
      { name: 'X', icon: Twitter, url: process.env.NEXT_PUBLIC_X_URL, color: 'slate-800' },
      { name: 'YouTube', icon: Youtube, url: process.env.NEXT_PUBLIC_YOUTUBE_URL, color: 'red-600' },
      { name: 'LinkedIn', icon: Linkedin, url: process.env.NEXT_PUBLIC_LINKEDIN_URL, color: 'blue-700' },
      { name: 'WhatsApp', icon: MessageSquare, url: process.env.NEXT_PUBLIC_WHATSAPP_URL, color: 'primary-500' },
      { name: 'Discord', icon: MessageSquare, url: process.env.NEXT_PUBLIC_DISCORD_URL, color: 'indigo-500' },
      { name: 'Telegram', icon: Send, url: process.env.NEXT_PUBLIC_TELEGRAM_URL, color: 'sky-500' },
      { name: 'Pinterest', icon: FaPinterest, url: process.env.NEXT_PUBLIC_PINTEREST_URL, color: 'red-500' },
   ];

   return (
      <MobileAppWrapper title={translate('Contact Support')}>
         <div className="min-h-screen bg-background-page animate-fade-in selection:bg-primary-600 selection:text-white font-outfit mt-0">
            <div className="py-10 xl:py-20 space-y-12 xl:space-y-20">

               {/* --- Header Section --- */}
               <PageHero
                  icon={MessageSquare}
                  eyebrow={translate('Contact Support')}
                  title={rich('Contact <0>Support</0>', [(c) => <span className="text-primary-600">{c}</span>])}
               />

               <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-10 items-start">

                  {/* --- Contact Details --- */}
                  <div className="xl:col-span-6 space-y-8">
                     <address className="not-italic grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {[
                           { label: 'Email Support', val: contactInfo.email, icon: Mail, color: 'primary' },
                           { label: 'Phone Number', val: contactInfo.phone, icon: Phone, color: 'primary' },
                           { label: 'Office Address', val: contactInfo.address, icon: MapPin, color: 'primary' },
                           { label: 'Working Hours', val: contactInfo.businessHours, icon: Clock, color: 'primary' }
                        ].map((item, i) => (
                           <Card key={i} className="flex items-center gap-6 xl:gap-10 border border-border-primary hover:border-primary-500/30 transition-all rounded-3xl xl:rounded-3xl bg-background-surface group">
                              <div className={`w-12 h-12 xl:w-14 xl:h-14 flex items-center justify-center bg-${item.color === 'primary' ? 'primary-500' : item.color + '-500'}/25 text-${item.color === 'primary' ? 'primary' : item.color}-500 rounded-lg xl:rounded-xl xl:rounded-2xl border border-transparent group-hover:border-current transition-all shrink-0`}>
                                 <item.icon className="w-5 h-5 xl:w-6 xl:h-6" />
                              </div>
                              <div className="min-w-0">
                                 <p className="text-[9px] xl:text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] leading-none mb-1.5 xl:mb-2">{translate(item.label)}</p>
                                 <p className="text-sm xl:text-base font-bold text-content-primary uppercase tracking-tight truncate">{item.val}</p>
                              </div>
                           </Card>
                        ))}
                     </address>

                     {/* Social Links */}
                     <Card as="section" className="space-y-6 bg-background-surface border border-border-primary overflow-hidden relative rounded-3xl">
                        <div className="relative z-10 space-y-6">
                           <section className="space-y-1">
                              <h2 className="text-[10px] font-bold uppercase tracking-[0.08em] text-primary-600">{translate('Follow Us')}</h2>
                              <p className="text-xl font-bold font-outfit tracking-tight text-content-primary">{translate('Find Us on Social Media')}</p>
                           </section>
                           <div className="flex flex-wrap gap-4">
                              {socialLinks.map((s, i) => (
                                 <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={translate('Follow us on {name}', { name: s.name })} className="w-11 h-11 bg-background-surface hover:bg-primary-700 hover:text-white dark:hover:text-white flex items-center justify-center rounded-md xl:rounded-md transition-all border border-primary-600 text-primary-600 group/link">
                                    <s.icon className="w-5 h-5 group-hover/link:scale-110 transition-transform" />
                                 </a>
                              ))}
                           </div>
                        </div>
                        <Sparkles className="absolute -bottom-10 -right-10 w-24 xl:w-48 h-24 xl:h-48 text-white/5" />
                     </Card>

                     {/* Support Info */}
                     <Card as="section" className="border-none text-content-primary border border-border-primary overflow-hidden group relative bg-background-surface">
                        <div className="flex items-center gap-5 relative z-10">
                           <div className="w-14 h-14 rounded-md border border-primary-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 text-primary-600">
                              <Headset className="w-8 h-8" />
                           </div>
                           <div className="space-y-1">
                              <h3 className="text-xl font-bold font-outfit tracking-tight leading-none">{translate('We Are Here For You')}</h3>
                              <p className="text-xs font-medium opacity-90">{translate('Students always come first. We are ready to help.')}</p>
                           </div>
                        </div>
                        <Sparkles className="absolute top-0 right-0 w-20 xl:w-32 h-20 xl:h-32 text-slate-900/10 dark:text-white/10 pointer-events-none" />
                     </Card>
                  </div>

                  {/* --- Contact Form --- */}
                  <div className="xl:col-span-6">
                     <Card as="section" className="space-y-8 border border-border-primary rounded-3xl xl:rounded-3xl bg-background-surface relative overflow-hidden">

                        <section className="space-y-6 relative z-10">
                           <h2 className="text-2xl xl:text-xl md:text-2xl xl:text-4xl font-bold font-outfit tracking-tight text-content-primary">{translate('Send a Message')}</h2>
                           <p className="text-xs xl:text-sm font-medium text-content-muted">{translate('We usually reply within 24 hours. Write to us anytime.')}</p>
                        </section>

                        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                           <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                              <div className="space-y-2 xl:space-y-4">
                                 <label className="text-[10px] font-bold text-content-secondary uppercase tracking-[0.08em] px-2 block">{translate('Your Full Name')}</label>
                                 <input
                                    className="w-full px-6 py-5 rounded-2xl border border-border-primary font-bold text-content-primary outline-none focus:border-primary-700 focus:ring-4 focus:ring-primary-500/5 transition-all placeholder:text-content-muted autofill:[-webkit-text-fill-color:white]"
                                    placeholder={translate('e.g. John Doe')}
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required
                                 />
                              </div>
                              <div className="space-y-2 xl:space-y-4">
                                 <label className="text-[10px] font-bold text-content-secondary uppercase tracking-[0.08em] px-2 block">{translate('Email Address')}</label>
                                 <input
                                    type="email"
                                    className="w-full px-6 py-5 rounded-2xl border border-border-primary font-bold text-content-primary outline-none focus:border-primary-700 focus:ring-4 focus:ring-primary-500/5 transition-all placeholder:text-content-muted autofill:[-webkit-text-fill-color:white]"
                                    placeholder={translate('john@example.com')}
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required
                                 />
                              </div>
                           </div>

                           <div className="space-y-2 xl:space-y-4">
                              <label className="text-[10px] font-bold text-content-secondary uppercase tracking-[0.08em] px-2 block">{translate('Subject')}</label>
                              <input
                                 className="w-full px-6 py-5 rounded-2xl border border-border-primary font-bold text-content-primary outline-none focus:border-primary-700 focus:ring-4 focus:ring-primary-500/5 transition-all placeholder:text-content-muted autofill:[-webkit-text-fill-color:white]"
                                 placeholder={translate('How can we help?')}
                                 value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} required
                              />
                           </div>

                           <div className="space-y-2 xl:space-y-4">
                              <label className="text-[10px] font-bold text-content-secondary uppercase tracking-[0.08em] px-2 block">{translate('Your Message')}</label>
                              <textarea
                                 rows="5"
                                 className="w-full px-6 py-5 rounded-2xl border border-border-primary font-bold text-content-primary outline-none focus:border-primary-700 focus:ring-4 focus:ring-primary-500/5 transition-all resize-none placeholder:text-content-muted autofill:[-webkit-text-fill-color:white]"
                                 placeholder={translate('Type your message here...')}
                                 value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} required
                              />
                           </div>

                           <AnimatePresence>
                              {status === 'success' && (
                                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 text-primary-600 rounded-2xl border border-primary-500/20 flex items-center gap-3">
                                    <CircleCheck className="w-5 h-5" />
                                    <span className="text-xs font-bold uppercase tracking-[0.08em]">{translate('Message Sent Successfully!')}</span>
                                 </motion.div>
                              )}
                              {status === 'error' && (
                                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-black/25 dark:bg-white/25 text-content-primary rounded-2xl border border-border-primary flex items-center gap-3">
                                    <CircleAlert className="w-5 h-5" />
                                    <span className="text-xs font-bold uppercase tracking-[0.08em]">{translate('Error sending message. Please try again.')}</span>
                                 </motion.div>
                              )}
                           </AnimatePresence>

                           <Button
                              variant="primary"
                              fullWidth
                              className="bg-primary-600 hover:bg-primary-600 active:bg-primary-600 text-on-primary py-6 rounded-2xl font-bold tracking-[0.08em] text-base xl:text-lg active:border-b-0 border-primary-600 active:translate-y-1 transition-all flex items-center justify-center gap-4"
                              type="submit"
                              disabled={loading}
                           >
                              {loading ? translate('SENDING...') : (
                                 <div className='flex items-center gap-2'>
                                    <Send className="w-5 h-5" /> {translate('SEND MESSAGE')}
                                 </div>
                              )}
                           </Button>
                        </form>
                     </Card>
                  </div>
               </div>

               {/* --- Feature Grid --- */}
               <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                     { title: 'Fast Reply', desc: 'We reply to your question within 24 hours on working days.', icon: Rocket, color: 'primary' },
                     { title: 'Always Available', desc: 'You can contact us any time. We are here to help.', icon: ShieldCheck, color: 'primary' },
                     { title: 'Helpful Team', desc: 'Our team knows the platform well and can solve your problem quickly.', icon: GraduationCap, color: 'primary' }
                  ].map((f, i) => (
                     <Card as="article" key={i} className="text-center space-y-5 border border-border-primary rounded-3xl /40 transition-all group relative overflow-hidden">
                        <div className={`p-4 bg-${f.color === 'primary' ? 'primary' : f.color}-500/25 text-${f.color === 'primary' ? 'primary' : f.color}-500 rounded-2xl w-fit mx-auto border border-transparent group-hover:border-current transition-all`}>
                           <f.icon className="w-6 h-6" />
                        </div>
                        <div className="space-y-3">
                           <h3 className="text-lg font-bold font-outfit tracking-tight text-content-primary leading-none">{translate(f.title)}</h3>
                           <p className="text-xs font-medium text-content-muted leading-relaxed max-w-[200px] mx-auto">{translate(f.desc)}</p>
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






