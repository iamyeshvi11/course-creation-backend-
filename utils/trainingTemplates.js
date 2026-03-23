/**
 * Predefined training templates for various compliance categories
 */

const templates = {
  // POSH Template
  POSH: {
    title: 'POSH: Prevention of Sexual Harassment',
    description: 'Mandatory training on identifying, preventing, and reporting sexual harassment at workplace as per Indian law (Sexual Harassment of Women at Workplace Act, 2013)',
    modules: [
      {
        title: 'Understanding Sexual Harassment',
        contentBlocks: [
          'Sexual harassment at the workplace is any unwelcome sexually determined behavior, whether directly or by implication. This includes physical contact, a demand or request for sexual favors, sexually colored remarks, showing pornography, or any other unwelcome physical, verbal, or non-verbal conduct of a sexual nature.',
          'The Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 mandates all organizations with 10 or more employees to constitute an Internal Complaints Committee (ICC) to address complaints of sexual harassment.',
          'Sexual harassment can occur in various forms including quid pro quo (demanding sexual favors in exchange for job benefits), hostile work environment (creating an intimidating or offensive workplace), and gender-based harassment.'
        ],
        quiz: [
          {
            question: 'Which act governs sexual harassment at workplace in India?',
            options: [
              'Indian Penal Code, 1860',
              'Sexual Harassment of Women at Workplace Act, 2013',
              'Industrial Disputes Act, 1947',
              'Employees Provident Fund Act, 1952'
            ],
            correctAnswer: 1,
            explanation: 'The Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 specifically addresses workplace sexual harassment.'
          },
          {
            question: 'What is quid pro quo harassment?',
            options: [
              'Verbal abuse in the workplace',
              'Demanding sexual favors in exchange for job benefits',
              'Physical assault',
              'Gender discrimination'
            ],
            correctAnswer: 1,
            explanation: 'Quid pro quo harassment involves demanding sexual favors in exchange for employment decisions like promotions or favorable treatment.'
          }
        ]
      },
      {
        title: 'Identifying Inappropriate Behavior',
        contentBlocks: [
          'Recognizing sexual harassment is the first step in prevention. This includes unwelcome physical contact, inappropriate comments about appearance or body, sexual jokes or innuendos, displaying sexually explicit materials, and unwanted romantic advances.',
          'Verbal harassment includes making sexual comments, asking about sexual fantasies or preferences, making kissing sounds or catcalls, and telling sexual jokes or stories. Non-verbal harassment includes staring or leering, making sexual gestures, and displaying sexually suggestive objects or images.',
          'Remember that the key factor is whether the behavior is UNWELCOME. Even if something seems harmless to one person, if it makes another person uncomfortable, it could constitute harassment.'
        ],
        quiz: [
          {
            question: 'What is the key factor in determining sexual harassment?',
            options: [
              'The intent of the perpetrator',
              'Whether the behavior is unwelcome to the recipient',
              'The severity of the action',
              'The frequency of occurrence'
            ],
            correctAnswer: 1,
            explanation: 'The primary factor is whether the behavior is unwelcome to the recipient, regardless of the perpetrator\'s intent.'
          }
        ]
      },
      {
        title: 'Reporting and Response Procedures',
        contentBlocks: [
          'If you experience or witness sexual harassment, report it immediately to the Internal Complaints Committee (ICC). Your complaint will be treated confidentially and investigated thoroughly. You are protected from retaliation under the law.',
          'The ICC must complete the inquiry within 90 days of receiving the complaint. Both parties have the right to be heard, present evidence, and call witnesses. The committee will provide a fair and impartial investigation.',
          'Organizations must ensure a safe work environment free from sexual harassment. Bystander intervention is encouraged - if you witness harassment, support the victim and report the incident. Remember, silence enables harassment.'
        ],
        quiz: [
          {
            question: 'Within how many days must the ICC complete its inquiry?',
            options: [
              '30 days',
              '60 days',
              '90 days',
              '120 days'
            ],
            correctAnswer: 2,
            explanation: 'The ICC must complete the inquiry within 90 days as per the POSH Act, 2013.'
          }
        ]
      }
    ]
  },

  // Phishing Awareness Template
  PHISHING: {
    title: 'Phishing Awareness & Email Security',
    description: 'Learn to identify and protect against phishing attacks, email scams, and social engineering threats that target employee credentials and sensitive information.',
    modules: [
      {
        title: 'Understanding Phishing Attacks',
        contentBlocks: [
          'Phishing is a cyberattack technique where attackers impersonate legitimate organizations to steal sensitive information like usernames, passwords, credit card details, or other personal data. These attacks typically arrive via email but can also occur through text messages (smishing) or phone calls (vishing).',
          'Common phishing tactics include urgent messages claiming account problems, fake invoices or payment requests, impersonation of executives or IT staff, lottery or prize notifications, and requests to verify account information.',
          'Phishing attacks cost organizations millions annually through data breaches, ransomware infections, and financial fraud. As an employee, you are the first line of defense against these threats.'
        ],
        quiz: [
          {
            question: 'What is phishing?',
            options: [
              'A type of computer virus',
              'A technique to steal information by impersonating legitimate organizations',
              'A method of encrypting emails',
              'A network security protocol'
            ],
            correctAnswer: 1,
            explanation: 'Phishing is a social engineering attack where attackers impersonate trusted entities to steal sensitive information.'
          }
        ]
      },
      {
        title: 'Identifying Phishing Emails',
        contentBlocks: [
          'Red flags of phishing emails include: generic greetings ("Dear Customer"), urgent or threatening language, grammatical errors and typos, suspicious sender addresses, mismatched URLs (hover over links to check), requests for sensitive information, and unexpected attachments.',
          'Always verify the sender\'s email address carefully. Phishers often use addresses that look similar to legitimate ones (e.g., support@c0mpany.com instead of support@company.com). Check the display name and the actual email address.',
          'Be especially cautious of emails that create a sense of urgency, claim your account will be suspended, or offer prizes/money. Legitimate organizations never ask for passwords via email.'
        ],
        quiz: [
          {
            question: 'Which is a red flag for phishing emails?',
            options: [
              'Personalized greeting with your name',
              'Email from a colleague you know',
              'Generic greeting like "Dear Customer"',
              'Company logo in the email'
            ],
            correctAnswer: 2,
            explanation: 'Generic greetings are common in phishing emails because attackers don\'t have your personal information.'
          },
          {
            question: 'What should you do before clicking a link in an email?',
            options: [
              'Click it immediately if it looks legitimate',
              'Hover over it to check the actual URL',
              'Forward it to friends',
              'Reply to confirm it\'s safe'
            ],
            correctAnswer: 1,
            explanation: 'Always hover over links to verify the actual destination URL before clicking.'
          }
        ]
      },
      {
        title: 'Protecting Yourself and the Organization',
        contentBlocks: [
          'Best practices to avoid phishing: Never click suspicious links or download unexpected attachments, verify requests independently (call the person directly), use strong, unique passwords, enable multi-factor authentication, and keep software updated.',
          'If you receive a suspicious email: Do not click links or open attachments, do not reply or provide any information, report it to IT security immediately, and delete the email after reporting.',
          'Use secure browsing practices: Look for HTTPS and padlock icons, bookmark important sites instead of clicking email links, and be cautious on public Wi-Fi. Remember: when in doubt, don\'t click - verify through official channels.'
        ],
        quiz: [
          {
            question: 'What should you do if you receive a suspicious email?',
            options: [
              'Delete it immediately without reporting',
              'Reply to ask if it\'s legitimate',
              'Report it to IT security and then delete it',
              'Forward it to colleagues to warn them'
            ],
            correctAnswer: 2,
            explanation: 'Always report suspicious emails to IT security before deleting them. This helps protect the entire organization.'
          }
        ]
      }
    ]
  },

  // Cybersecurity Template
  CYBERSEC: {
    title: 'Cybersecurity Fundamentals',
    description: 'Essential cybersecurity practices and awareness for protecting organizational assets, data, and systems from cyber threats.',
    modules: [
      {
        title: 'Introduction to Cybersecurity',
        contentBlocks: [
          'Cybersecurity is the practice of protecting systems, networks, programs, and data from digital attacks. These attacks usually aim to access, change, or destroy sensitive information, extort money, or disrupt business operations.',
          'Common cyber threats include malware (viruses, ransomware, spyware), phishing attacks, password attacks, SQL injection, man-in-the-middle attacks, and denial of service attacks.',
          'Every employee plays a critical role in cybersecurity. Most breaches occur due to human error - clicking malicious links, using weak passwords, or falling for social engineering.'
        ],
        quiz: [
          {
            question: 'What is the primary cause of most security breaches?',
            options: [
              'Advanced hacking techniques',
              'Human error',
              'Outdated software',
              'Weak firewalls'
            ],
            correctAnswer: 1,
            explanation: 'Human error, such as clicking malicious links or using weak passwords, is the leading cause of security breaches.'
          }
        ]
      },
      {
        title: 'Password Security and Authentication',
        contentBlocks: [
          'Strong passwords are your first line of defense. Create passwords with at least 12 characters, mixing uppercase, lowercase, numbers, and special characters. Avoid common words, personal information, or sequential patterns.',
          'Never reuse passwords across multiple accounts. If one account is compromised, all accounts with the same password become vulnerable. Use a password manager to securely store unique passwords.',
          'Enable Multi-Factor Authentication (MFA) wherever possible. MFA requires additional verification beyond your password, such as a code sent to your phone, making it much harder for attackers to access your accounts.'
        ],
        quiz: [
          {
            question: 'What makes a strong password?',
            options: [
              'Your birthdate and name',
              'A common word with numbers',
              'At least 12 characters with mixed character types',
              'Your pet\'s name'
            ],
            correctAnswer: 2,
            explanation: 'Strong passwords have at least 12 characters mixing uppercase, lowercase, numbers, and special characters.'
          }
        ]
      },
      {
        title: 'Safe Internet and Device Practices',
        contentBlocks: [
          'Keep all software and operating systems updated with the latest security patches. Enable automatic updates where possible. Outdated software contains vulnerabilities that attackers exploit.',
          'Be cautious on public Wi-Fi networks. Avoid accessing sensitive information or conducting financial transactions on public networks. Use a VPN (Virtual Private Network) if you must work on public Wi-Fi.',
          'Secure your devices: Use screen locks, encrypt sensitive data, be careful about what you install, and report lost or stolen devices immediately. Remember: your device is a gateway to company systems and data.'
        ],
        quiz: [
          {
            question: 'Why should you avoid public Wi-Fi for sensitive work?',
            options: [
              'It\'s too slow',
              'It\'s expensive',
              'It\'s vulnerable to interception and attacks',
              'It drains battery faster'
            ],
            correctAnswer: 2,
            explanation: 'Public Wi-Fi networks are unsecured and vulnerable to interception, making them unsafe for sensitive activities.'
          }
        ]
      }
    ]
  },

  // Default Template for unknown categories
  DEFAULT: {
    title: '{topic}',
    description: 'Comprehensive training on {topic} covering key concepts, best practices, and regulatory requirements.',
    modules: [
      {
        title: 'Introduction to {topic}',
        contentBlocks: [
          'This module provides an overview of {topic} and its importance in the workplace. Understanding these concepts is crucial for maintaining compliance and organizational excellence.',
          'We will explore the fundamental principles, key regulations, and practical applications relevant to your role and responsibilities.',
          'By the end of this training, you will be able to identify key requirements, implement best practices, and understand your obligations regarding {topic}.'
        ],
        quiz: [
          {
            question: 'Why is training on {topic} important?',
            options: [
              'To meet regulatory requirements',
              'To improve workplace safety and compliance',
              'To reduce organizational risks',
              'All of the above'
            ],
            correctAnswer: 3,
            explanation: 'Training on compliance topics serves multiple critical purposes including regulatory compliance, safety improvement, and risk reduction.'
          }
        ]
      },
      {
        title: 'Key Principles and Requirements',
        contentBlocks: [
          'Understanding the core principles of {topic} is essential for implementation. These principles guide decision-making and ensure consistent application across the organization.',
          'Regulatory requirements vary by industry and location. It is important to understand which regulations apply to your specific context and how to maintain compliance.',
          'Best practices go beyond minimum compliance requirements and represent industry-leading approaches to {topic}. Adopting these practices demonstrates organizational commitment to excellence.'
        ],
        quiz: [
          {
            question: 'What are best practices?',
            options: [
              'Minimum legal requirements',
              'Industry-leading approaches that exceed minimum requirements',
              'Optional guidelines',
              'Internal policies only'
            ],
            correctAnswer: 1,
            explanation: 'Best practices represent industry-leading approaches that go beyond minimum compliance requirements.'
          }
        ]
      },
      {
        title: 'Practical Application',
        contentBlocks: [
          'Applying your knowledge of {topic} in daily work situations is crucial. This includes recognizing relevant scenarios, making appropriate decisions, and taking correct actions.',
          'When faced with questions or uncertainty, always consult with your supervisor, compliance officer, or relevant department. It is better to ask questions than to make assumptions.',
          'Remember that compliance is an ongoing commitment. Stay informed about updates to policies and regulations, participate in refresher training, and contribute to a culture of compliance within your organization.'
        ],
        quiz: [
          {
            question: 'What should you do if you are uncertain about a compliance matter?',
            options: [
              'Make your best guess',
              'Ignore it and continue working',
              'Consult with your supervisor or compliance officer',
              'Wait and see what others do'
            ],
            correctAnswer: 2,
            explanation: 'Always consult with appropriate personnel when uncertain about compliance matters rather than making assumptions.'
          }
        ]
      }
    ]
  }
};

module.exports = templates;
