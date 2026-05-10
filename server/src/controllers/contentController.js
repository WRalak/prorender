// Get about page content
exports.getAboutContent = async (req, res, next) => {
  try {
    const aboutContent = {
      company: {
        name: 'PropRent',
        founded: '2020',
        mission: 'To revolutionize the rental market by providing transparency, technology, and superior service for tenants and agents alike.',
        vision: 'To become the most trusted and innovative rental platform globally.',
        values: [
          'Transparency in all transactions',
          'Technology-driven solutions',
          'Exceptional user experience',
          'Community building',
          'Sustainable practices'
        ]
      },
      stats: {
        propertiesListed: '50,000+',
        activeUsers: '100,000+',
        citiesCovered: '100+',
        satisfactionRate: '98%'
      },
      team: [
        {
          name: 'John Smith',
          role: 'CEO & Founder',
          bio: 'Former real estate agent with 15+ years of experience in property management.',
          image: 'https://ui-avatars.com/api/?name=John+Smith&background=3b82f6&color=fff'
        },
        {
          name: 'Sarah Johnson',
          role: 'CTO',
          bio: 'Tech enthusiast focused on building scalable platforms for real estate.',
          image: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=10b981&color=fff'
        },
        {
          name: 'Michael Chen',
          role: 'Head of Operations',
          bio: 'Expert in streamlining processes and ensuring excellent service delivery.',
          image: 'https://ui-avatars.com/api/?name=Michael+Chen&background=f59e0b&color=fff'
        }
      ],
      milestones: [
        {
          year: '2020',
          title: 'Company Founded',
          description: 'Started with a vision to transform rental experience'
        },
        {
          year: '2021',
          title: 'Platform Launch',
          description: 'Launched MVP with 1000+ properties'
        },
        {
          year: '2022',
          title: 'Series A Funding',
          description: 'Raised $5M to expand operations'
        },
        {
          year: '2023',
          title: 'National Expansion',
          description: 'Expanded to cover 50+ cities'
        },
        {
          year: '2024',
          title: 'Innovation Award',
          description: 'Recognized as most innovative real estate platform'
        }
      ]
    };

    res.json({
      success: true,
      content: aboutContent
    });
  } catch (error) {
    next(error);
  }
};

// Get contact information
exports.getContactInfo = async (req, res, next) => {
  try {
    const contactInfo = {
      company: {
        name: 'PropRent',
        address: '123 Business Ave, Suite 100, New York, NY 10001',
        phone: '+1 (555) 123-4567',
        email: 'support@prorent.com',
        website: 'www.prorent.com'
      },
      offices: [
        {
          city: 'New York',
          address: '123 Business Ave, Suite 100, New York, NY 10001',
          phone: '+1 (555) 123-4567',
          email: 'nyc@prorent.com',
          hours: 'Mon-Fri 9AM-6PM EST'
        },
        {
          city: 'Los Angeles',
          address: '456 Hollywood Blvd, Suite 200, Los Angeles, CA 90028',
          phone: '+1 (555) 234-5678',
          email: 'la@prorent.com',
          hours: 'Mon-Fri 9AM-6PM PST'
        },
        {
          city: 'Chicago',
          address: '789 Michigan Ave, Suite 300, Chicago, IL 60611',
          phone: '+1 (555) 345-6789',
          email: 'chicago@prorent.com',
          hours: 'Mon-Fri 9AM-6PM CST'
        }
      ],
      departments: [
        {
          name: 'Customer Support',
          email: 'support@prorent.com',
          phone: '+1 (555) 123-4567',
          description: 'For general inquiries and account assistance'
        },
        {
          name: 'Agent Services',
          email: 'agents@prorent.com',
          phone: '+1 (555) 234-5678',
          description: 'For agents looking to list properties'
        },
        {
          name: 'Technical Support',
          email: 'tech@prorent.com',
          phone: '+1 (555) 345-6789',
          description: 'For technical issues and platform support'
        },
        {
          name: 'Partnerships',
          email: 'partnerships@prorent.com',
          description: 'For business partnerships and collaborations'
        }
      ],
      socialMedia: {
        facebook: 'https://facebook.com/prorent',
        twitter: 'https://twitter.com/prorent',
        linkedin: 'https://linkedin.com/company/prorent',
        instagram: 'https://instagram.com/prorent'
      }
    };

    res.json({
      success: true,
      contact: contactInfo
    });
  } catch (error) {
    next(error);
  }
};

// Submit contact form
exports.submitContactForm = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message, department } = req.body;
    
    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required'
      });
    }
    
    // Here you would typically:
    // 1. Save the contact form submission to database
    // 2. Send email notification to relevant department
    // 3. Send confirmation email to user
    // 4. Create support ticket if needed
    
    // For now, just return success
    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully. We\'ll get back to you within 24 hours.'
    });
  } catch (error) {
    next(error);
  }
};

// Get FAQ
exports.getFAQ = async (req, res, next) => {
  try {
    const faq = [
      {
        category: 'For Tenants',
        questions: [
          {
            question: 'How do I search for properties?',
            answer: 'You can search for properties using our search bar, filter by location, price, bedrooms, and other criteria. You can also save searches and set up alerts.'
          },
          {
            question: 'How do I apply for a property?',
            answer: 'Click "Apply Now" on any property listing, fill out the application form, upload required documents, and submit. You can track your application status in your dashboard.'
          },
          {
            question: 'What documents do I need to apply?',
            answer: 'Typically you\'ll need ID proof, income verification, employment verification, and references. Specific requirements may vary by property.'
          },
          {
            question: 'Is my information secure?',
            answer: 'Yes, we use bank-level encryption to protect your personal and financial information. We never share your data without your consent.'
          }
        ]
      },
      {
        category: 'For Agents',
        questions: [
          {
            question: 'How do I list a property?',
            answer: 'Sign up as an agent, complete your profile, and click "List Property". Fill in all required details, upload photos, and submit for approval.'
          },
          {
            question: 'What are the fees?',
            answer: 'We offer different subscription plans with varying limits and features. Check our pricing page for detailed information.'
          },
          {
            question: 'How do I manage applications?',
            answer: 'Access your agent dashboard to view, review, and respond to applications. You can approve, reject, or request additional information.'
          },
          {
            question: 'Can I edit my listings?',
            answer: 'Yes, you can edit your property listings anytime from your dashboard. Changes may require re-approval depending on the nature of the update.'
          }
        ]
      },
      {
        category: 'General',
        questions: [
          {
            question: 'How does PropRent make money?',
            answer: 'We charge subscription fees to agents for listing properties and a small service fee for successful rentals through our platform.'
          },
          {
            question: 'Is PropRent available nationwide?',
            answer: 'We\'re currently available in 100+ cities and expanding rapidly. Check our coverage map for specific locations.'
          },
          {
            question: 'What if I have a dispute?',
            answer: 'We have a dedicated dispute resolution team. Contact support with details, and we\'ll help mediate between parties.'
          }
        ]
      }
    ];

    res.json({
      success: true,
      faq
    });
  } catch (error) {
    next(error);
  }
};

// Get careers information
exports.getCareers = async (req, res, next) => {
  try {
    const careers = {
      company: {
        name: 'PropRent',
        culture: 'We\'re a diverse team passionate about revolutionizing the rental industry. We value innovation, collaboration, and work-life balance.',
        benefits: [
          'Competitive salary and equity',
          'Comprehensive health insurance',
          'Flexible work arrangements',
          'Professional development budget',
          'Generous PTO and parental leave',
          'Wellness programs and gym membership',
          'Team building events and outings'
        ]
      },
      openings: [
        {
          title: 'Senior Frontend Developer',
          department: 'Engineering',
          location: 'New York, NY (Remote)',
          type: 'Full-time',
          experience: '5+ years',
          description: 'We\'re looking for a senior frontend developer to help build our next-generation rental platform.',
          requirements: [
            '5+ years of React/Next.js experience',
            'Strong TypeScript skills',
            'Experience with modern CSS frameworks',
            'Knowledge of responsive design principles',
            'Experience with RESTful APIs'
          ],
          niceToHave: [
            'Experience with Node.js',
            'Knowledge of cloud services',
            'Previous real estate tech experience'
          ]
        },
        {
          title: 'Product Manager',
          department: 'Product',
          location: 'New York, NY',
          type: 'Full-time',
          experience: '3+ years',
          description: 'Lead product development for our core rental platform features.',
          requirements: [
            '3+ years of product management experience',
            'Experience with agile development',
            'Strong analytical and communication skills',
            'Understanding of user experience principles',
            'Ability to work with cross-functional teams'
          ]
        },
        {
          title: 'Customer Success Manager',
          department: 'Operations',
          location: 'Remote',
          type: 'Full-time',
          experience: '2+ years',
          description: 'Help our users get the most out of PropRent and ensure their success.',
          requirements: [
            '2+ years of customer success experience',
            'Excellent communication skills',
            'Experience with CRM software',
            'Ability to analyze data and identify trends',
            'Problem-solving mindset'
          ]
        }
      ]
    };

    res.json({
      success: true,
      careers
    });
  } catch (error) {
    next(error);
  }
};

// Submit job application
exports.submitApplication = async (req, res, next) => {
  try {
    const { name, email, phone, position, coverLetter, resume } = req.body;
    
    // Validate required fields
    if (!name || !email || !position) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and position are required'
      });
    }
    
    // Here you would typically:
    // 1. Save the application to database
    // 2. Store resume file
    // 3. Send notification to HR team
    // 4. Send confirmation email to applicant
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully. We\'ll review your application and get back to you if there\'s a good match.'
    });
  } catch (error) {
    next(error);
  }
};
