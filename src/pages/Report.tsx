import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../components/auth/AuthProvider';
import { auth, db, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

type FormData = {
  fullName: string;
  nickname: string;
  age: number;
  gender: string;
  clothingDescription: string;
  height: string;
  languageSpoken: string;
  motherName: string;
  fatherName: string;
  siblingNames: string;
  school: string;
  village: string;
  locality: string;
  colony: string;
  nearbyLandmark: string;
  lastSeenLocation: string;
  missingDate: string;
  mentalCondition: string;
  medicalCondition: string;
  additionalNotes: string;
  primaryPhone: string;
  secondaryPhone: string;
  whatsappNumber: string;
  rewardAvailable: boolean;
  rewardAmount: number;
};

export function Report() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
      defaultValues: {
          rewardAvailable: false,
          missingDate: new Date().toISOString().split('T')[0]
      }
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Signed in! Now you can create a report.');
    } catch (error) {
      toast.error('Failed to sign in');
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, 'missing_persons'), {
        ...data,
        reporterId: user.uid,
        status: 'ACTIVE',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.fullName}-${Date.now()}` // Default placeholder
      });
      toast.success('Report filed successfully!');
      navigate(`/case/${docRef.id}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to file report');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-32 text-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200"
        >
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-8 text-slate-400">
            <LockIcon className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-4">Verification Required</h1>
          <p className="text-slate-500 mb-8 leading-relaxed max-w-sm mx-auto">
            To ensure authenticity, we only allow verified users to file missing person reports.
          </p>
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-base hover:bg-blue-700 transition-all shadow-lg active:scale-95"
          >
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  const stepTitles = ["Person Details", "Memory Fragments", "Incident Info", "Contact Details"];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
           <h1 className="text-3xl font-black text-slate-800 tracking-tight">Create Search Report</h1>
           <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-widest">
             Step {step} / 4
           </span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className={`flex-1 transition-all duration-500 ${step >= i ? 'bg-blue-600' : 'bg-slate-200'}`}
            />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-slate-200 space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Full Name *</label>
                  <input
                    {...register('fullName', { required: true })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:bg-white transition-all"
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nickname</label>
                  <input
                    {...register('nickname')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:bg-white transition-all"
                    placeholder="Any common nickname"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Approximate Age *</label>
                  <input
                    type="number"
                    {...register('age', { required: true, min: 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:bg-white transition-all"
                    placeholder="Age in years"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gender *</label>
                  <select
                    {...register('gender', { required: true })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:bg-white transition-all appearance-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Clothing Description</label>
                <textarea
                  {...register('clothingDescription')}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:bg-white transition-all"
                  placeholder="What were they wearing when last seen?"
                />
              </div>

              <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-center flex flex-col items-center">
                <Upload className="w-8 h-8 text-slate-400 mb-4" />
                <h4 className="font-bold text-slate-800 mb-1">Upload Photo</h4>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">JPG, PNG up to 5MB</p>
                <div className="mt-4 text-[9px] font-bold text-orange-600 bg-orange-50 px-4 py-1.5 rounded-full border border-orange-100 uppercase tracking-widest">Placeholder will be used for demo</div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-slate-200 space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mother's Name</label>
                  <input
                    {...register('motherName')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:bg-white transition-all"
                    placeholder="Maa's name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Father's Name</label>
                  <input
                    {...register('fatherName')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:bg-white transition-all"
                    placeholder="Papa's name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Siblings</label>
                  <input
                    {...register('siblingNames')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:bg-white transition-all"
                    placeholder="Brothers/Sisters names"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Village/Hometown</label>
                  <input
                    {...register('village')}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
                    placeholder="Native place"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">School Name</label>
                  <input
                    {...register('school')}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
                    placeholder="Where do they study?"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Locality/Area</label>
                  <input
                    {...register('locality')}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
                    placeholder="Specific area name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Colony</label>
                  <input
                    {...register('colony')}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
                    placeholder="Sector / Block"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Nearby Landmark</label>
                  <input
                    {...register('nearbyLandmark')}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
                    placeholder="Park, Mandir, Mall..."
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-sm border border-gray-100 space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Last Seen Location *</label>
                  <input
                    {...register('lastSeenLocation', { required: true })}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
                    placeholder="City, Station, Market..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Date Missing *</label>
                  <input
                    type="date"
                    {...register('missingDate', { required: true })}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Mental Condition</label>
                  <input
                    {...register('mentalCondition')}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
                    placeholder="Normal, Dementia, Autism..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Medical Condition</label>
                  <input
                    {...register('medicalCondition')}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
                    placeholder="Diabetes, Epilepsy, etc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Additional Notes</label>
                <textarea
                  {...register('additionalNotes')}
                  rows={4}
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
                  placeholder="Any other specific identifying marks or details?"
                />
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-sm border border-gray-100 space-y-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Primary Phone *</label>
                  <input
                    {...register('primaryPhone', { required: true })}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
                    placeholder="+91 XXXX XXX XXX"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Secondary Phone</label>
                  <input
                    {...register('secondaryPhone')}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
                    placeholder="+91 XXXX XXX XXX"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">WhatsApp No.</label>
                  <input
                    {...register('whatsappNumber')}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
                    placeholder="Same or different"
                  />
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-blue-50/50 border border-blue-100 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-900">Offer a Reward?</h4>
                    <p className="text-sm text-gray-500">Optional. Can help incentivize community search.</p>
                  </div>
                  <input
                     type="checkbox"
                     {...register('rewardAvailable')}
                     className="w-6 h-6 rounded-lg text-blue-600 focus:ring-blue-100 transition-all cursor-pointer"
                  />
                </div>
                
                {watch('rewardAvailable') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-bold text-gray-700 ml-1">Reward Amount (INR)</label>
                    <input
                      type="number"
                      {...register('rewardAmount', { required: true, min: 0 })}
                      className="w-full bg-white border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-100 transition-all font-bold text-blue-600"
                      placeholder="e.g. 10000"
                    />
                  </motion.div>
                )}
              </div>

              <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100 flex items-start space-x-4">
                <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0" />
                <p className="text-sm text-orange-900 leading-relaxed">
                  By submitting this report, you confirm that all information is accurate to your best knowledge. False reports are liable to legal action as per local laws.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between pt-8">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center space-x-2 text-gray-400 font-bold hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          ) : <div />}

          <div className="flex items-center space-x-4">
            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center space-x-2 bg-gray-900 text-white px-10 py-5 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl active:scale-95"
              >
                <span>Continue</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-3 bg-blue-600 text-white px-12 py-5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    <span>File Search Report</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

function LockIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0110 0v4"></path>
        </svg>
    );
}
