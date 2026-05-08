import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../context/AuthContext';
import { applicationAPI } from '../../../services/api';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const ApplicationForm = () => {
  const { user } = useAuth();
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const { data: property, isLoading: propertyLoading } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => fetch(`/api/properties/${propertyId}`).then(res => res.json()),
    enabled: !!propertyId,
  });

  const createApplicationMutation = useMutation({
    mutationFn: applicationAPI.createApplication,
    onSuccess: (data) => {
      toast.success('Application submitted successfully!');
      navigate(`/applications/${data._id}`);
    },
    onError: (error) => {
      toast.error('Failed to submit application');
    },
  });

  const { register, handleSubmit } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: user?.email || '',
      phone: '',
      employerName: '',
      monthlyIncome: '',
      currentAddress: '',
      reasonForMoving: '',
    },
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const onSubmit = (data) => {
    const applicationData = {
      property: propertyId,
      ...data,
    };
    createApplicationMutation.mutate(applicationData);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  {...register('firstName', { required: true })}
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  {...register('lastName', { required: true })}
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  {...register('email', { required: true })}
                  type="email"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  defaultValue={user?.email}
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Employment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Employer Name *
                </label>
                <input
                  {...register('employerName')}
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Company Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Income *
                </label>
                <input
                  {...register('monthlyIncome')}
                  type="number"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Address
                </label>
                <textarea
                  {...register('currentAddress')}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Current Address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Moving
                </label>
                <textarea
                  {...register('reasonForMoving')}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Why are you moving?"
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (propertyLoading) {
    return <LoadingSpinner size="large" text="Loading property details..." />;
  }

  if (!property && propertyId) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Property Not Found</h3>
        <p className="text-gray-600">
          The property you're trying to apply to is not available.
        </p>
        <button
          onClick={() => navigate('/search')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Browse Properties
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Apply for {property?.title || 'Property'}
          </h2>
          <div className="text-sm text-gray-600">
            Step {step} of 3
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Property Summary */}
      <Card className="mb-8">
        <Card.Header>
          <h3 className="text-lg font-medium text-gray-900">Property Details</h3>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="text-gray-900 font-medium">
                {property?.address?.street}, {property?.address?.city}, {property?.address?.state}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Rent</p>
              <p className="text-gray-900 font-medium">
                ${property?.pricing?.rent}/month
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Bedrooms/Bathrooms</p>
              <p className="text-gray-900 font-medium">
                {property?.bedrooms} bed, {property?.bathrooms} bath
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Square Feet</p>
              <p className="text-gray-900 font-medium">
                {property?.squareFeet} sqft
              </p>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Application Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <Card.Header>
            <h3 className="text-lg font-medium text-gray-900">
              Step {step}: {getStepTitle(step)}
            </h3>
          </Card.Header>
          <Card.Body>
            {renderStepContent()}
          </Card.Body>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={step === 1}
          >
            Previous
          </Button>
          {step < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              loading={createApplicationMutation.isLoading}
            >
              Submit Application
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

const getStepTitle = (step) => {
  const titles = [
    'Personal Information',
    'Employment Information',
    'Additional Information',
  ];
  return titles[step - 1];
};

export default ApplicationForm;
