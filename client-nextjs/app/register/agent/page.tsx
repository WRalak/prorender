"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAgentRegistration } from "../../../hooks/useApi";

export default function AgentRegistrationPage() {
  const router = useRouter();
  const { registerAgent, loading, error } = useAgentRegistration();
  const [formData, setFormData] = useState({
    companyName: "",
    licenseNumber: "",
    yearsOfExperience: "",
    bio: "",
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState(2); // Step 2 of 3
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Check if user is coming from step 1 (personal info)
  useEffect(() => {
    const step1Data = localStorage.getItem('agentRegistrationStep1');
    if (!step1Data) {
      // Redirect to step 1 if personal info is not completed
      router.push('/register/agent/step-1');
    }
  }, [router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Get step 1 data from localStorage
      const step1Data = JSON.parse(localStorage.getItem('agentRegistrationStep1') || '{}');
      
      // Combine all registration data
      const registrationData = {
        ...step1Data,
        ...formData,
        role: 'AGENT',
        step: 'professional_details',
      };

      // Submit registration
      const response = await registerAgent(registrationData, uploadedFile || undefined);
      
      if (response) {
        setSubmitSuccess(true);
        
        // Clear localStorage
        localStorage.removeItem('agentRegistrationStep1');
        
        // Redirect to subscription selection after 2 seconds
        setTimeout(() => {
          router.push('/agent/subscription');
        }, 2000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      // Error is already handled by the hook
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col">
      {/* Success Message */}
      {submitSuccess && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600">check_circle</span>
              </div>
              <div>
                <p className="font-medium text-green-900">Registration Successful!</p>
                <p className="text-sm text-green-700">Redirecting to subscription selection...</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600">error</span>
              </div>
              <div>
                <p className="font-medium text-red-900">Registration Error</p>
                <p className="text-sm text-red-700">{error.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow flex items-center justify-center pt-32 pb-20 px-gutter">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-[0px_12px_32px_rgba(0,0,0,0.06)] border border-outline-variant overflow-hidden">
          <div className="px-xl pt-xl pb-md border-b border-slate-100 bg-surface-container-low">
            <div className="flex items-center justify-between mb-lg">
              <div>
                <h1 className="font-headline-lg text-primary">Professional Details</h1>
                <p className="font-body-sm text-outline mt-xs">Step 2 of 3: Verification &amp; Experience</p>
              </div>
              <div className="flex items-center gap-base">
                <div className="h-2.5 w-8 rounded-full bg-primary-container"></div>
                <div className="h-2.5 w-8 rounded-full bg-primary"></div>
                <div className="h-2.5 w-8 rounded-full bg-slate-200"></div>
              </div>
            </div>
          </div>

          <form className="p-xl space-y-xl" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <div className="space-y-xs">
                <label className="font-label-bold text-on-surface">Company Name</label>
                <div className="relative">
                  <input
                    className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-md outline-none"
                    placeholder="e.g. Jenkins Realty Group"
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-xs">
                <label className="font-label-bold text-on-surface">License Number</label>
                <div className="relative">
                  <input
                    className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-md outline-none"
                    placeholder="RE-992031-TX"
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-xs">
              <label className="font-label-bold text-on-surface">Years of Experience</label>
              <select
                className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-md outline-none bg-white"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleInputChange}
              >
                <option value="">Select experience</option>
                <option value="1-3">1-3 Years</option>
                <option value="3-5">3-5 Years</option>
                <option value="5-10">5-10 Years</option>
                <option value="10+">10+ Years</option>
              </select>
            </div>

            <div className="space-y-xs">
              <label className="font-label-bold text-on-surface">Professional Bio</label>
              <textarea
                className="w-full px-md py-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body-md outline-none resize-none"
                placeholder="Tell potential clients about your expertise and history in the rental market..."
                rows={4}
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
              ></textarea>
              <p className="font-caption text-outline">Maximum 500 characters.</p>
            </div>

            <div className="space-y-xs">
              <label className="font-label-bold text-on-surface">Verification Documents</label>
              <label className="border-2 border-dashed border-outline-variant rounded-xl p-xl flex flex-col items-center justify-center bg-surface-container-lowest hover:bg-surface-container-low transition-colors cursor-pointer group">
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                />
                <div className="w-12 h-12 rounded-full bg-primary-fixed-dim flex items-center justify-center text-primary mb-md group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">cloud_upload</span>
                </div>
                <p className="font-label-bold text-on-surface">
                  {uploadedFile ? uploadedFile.name : "Upload Brokerage License or Certification"}
                </p>
                <p className="font-body-sm text-outline mt-xs text-center">
                  PDF, JPG, or PNG up to 10MB
                </p>
              </label>
            </div>

            <div className="flex items-center gap-md pt-md">
              <button
                className="flex-1 px-lg py-sm rounded-lg border border-primary text-primary font-label-bold hover:bg-primary-container/10 transition-colors"
                type="button"
              >
                Back
              </button>
              <button
                className="flex-[2] px-lg py-sm rounded-lg bg-primary text-white font-label-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Complete Registration'
                )}
              </button>
            </div>
          </form>

          <div className="p-xl bg-surface-container-low border-t border-slate-100">
            <div className="flex items-center gap-md mb-lg">
              <div className="flex-grow h-[1px] bg-outline-variant"></div>
              <span className="font-caption text-outline">OR CONTINUE WITH</span>
              <div className="flex-grow h-[1px] bg-outline-variant"></div>
            </div>
            <div className="grid grid-cols-2 gap-md">
              <button className="flex items-center justify-center gap-base px-md py-sm border border-outline-variant rounded-lg bg-white hover:bg-slate-50 transition-colors font-label-bold text-on-surface">
                <Image
                  alt="Google Logo"
                  className="w-5 h-5"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFBCWPzlCxg3eE2_1XSMTO50wCptlEKFM62EMEivFiakbsMFmCQntGLP4Vha7xCLBEdpNf069td8xF9Dvqcx1m31P_flLgcL6wWKAoe3Fr1NjRSp8lvuGrxy2kXcYkdfKIqDP4fv3h-5kMkaXPQj_JIPHbAG2a26AijeB1hPra-ZMGlcgivlxw7JRjwnb1xsIt2Yc3beaVuo5LNU6aY3jMud0A0BpDHHSKXdG8is-eWIuv7V_W_mFhF8LhoYsiPry6yqoRQemM3xw"
                  width={20}
                  height={20}
                />
                Google
              </button>
              <button className="flex items-center justify-center gap-base px-md py-sm border border-outline-variant rounded-lg bg-white hover:bg-slate-50 transition-colors font-label-bold text-on-surface">
                <span
                  className="material-symbols-outlined text-blue-600"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  work
                </span>
                LinkedIn
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Help Widget */}
      <div className="fixed bottom-lg right-lg hidden lg:block">
        <div className="flex flex-col gap-md">
          <div className="w-full max-w-[280px] bg-white p-lg rounded-xl shadow-lg border border-outline-variant">
            <div className="flex items-center gap-md mb-md">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined">support_agent</span>
              </div>
              <div>
                <p className="font-label-bold text-on-surface">Need Help?</p>
                <p className="font-caption text-outline">Agent Support Team</p>
              </div>
            </div>
            <p className="font-body-sm text-on-surface-variant mb-md">
              Our onboarding team is available to help you complete your professional profile.
            </p>
            <button className="w-full py-base bg-surface-container-high rounded-lg font-label-bold text-primary hover:bg-surface-container transition-colors">
              Chat With Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
