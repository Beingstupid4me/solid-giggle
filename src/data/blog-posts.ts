export interface BlogPost {
  slug: string;
  category: string;
  readTime: string;
  title: string;
  description: string;
  image: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  publishedAt: string;
  content: string; // Markdown content
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "managing-seasonal-allergies",
    category: "Wellness",
    readTime: "5 min read",
    title: "Managing Seasonal Allergies Effectively",
    description:
      "Learn how to handle the changing seasons effectively with our comprehensive guide.",
    image:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=1200&auto=format&fit=crop",
    author: {
      name: "Dr. Priya Sharma",
      role: "Allergist & Immunologist",
    },
    publishedAt: "2024-03-15",
    content: `
## Understanding Seasonal Allergies

Seasonal allergies, also known as hay fever or allergic rhinitis, affect millions of people every year. As the seasons change, different types of pollen and allergens fill the air, triggering a range of uncomfortable symptoms.

### Common Symptoms

- Sneezing and runny nose
- Itchy, watery eyes
- Nasal congestion
- Scratchy throat
- Fatigue and irritability

## Prevention Strategies

### Monitor Pollen Counts

Keep track of daily pollen forecasts in your area. On high pollen days, try to stay indoors, especially during peak hours (usually mid-morning to early afternoon).

### Create an Allergen-Free Zone

Your bedroom should be your sanctuary. Keep windows closed, use air purifiers with HEPA filters, and wash bedding weekly in hot water.

### Shower Before Bed

Pollen can cling to your hair and skin throughout the day. A quick shower before bed helps remove allergens and prevents them from transferring to your pillow.

## Treatment Options

### Over-the-Counter Medications

- **Antihistamines**: Reduce sneezing, itching, and runny nose
- **Decongestants**: Help relieve nasal stuffiness
- **Nasal corticosteroid sprays**: Reduce inflammation in the nasal passages

### Natural Remedies

- **Saline nasal rinse**: Helps flush out allergens
- **Local honey**: Some believe it can help build tolerance to local pollen
- **Butterbur extract**: Studies show it may help with symptoms

## When to See a Doctor

If over-the-counter treatments aren't providing relief, or if your symptoms are significantly impacting your quality of life, it's time to consult an allergist. They can perform tests to identify your specific triggers and recommend personalized treatment plans, including immunotherapy.

### Signs You Need Professional Help

- Symptoms lasting more than two weeks
- Difficulty sleeping due to symptoms
- Asthma symptoms triggered by allergies
- Recurring sinus infections

## The Bottom Line

Seasonal allergies don't have to control your life. With proper preparation, preventive measures, and the right treatment approach, you can enjoy every season comfortably.

---

*Need help managing your allergies at home? Book a teleconsultation with our specialists today.*
    `,
  },
  {
    slug: "future-of-telehealth",
    category: "Technology",
    readTime: "3 min read",
    title: "The Future of Telehealth and Virtual Care",
    description:
      "Virtual care is changing the landscape of medicine, making it easier than ever to see a specialist.",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200&auto=format&fit=crop",
    author: {
      name: "Dr. Amit Patel",
      role: "Healthcare Technology Specialist",
    },
    publishedAt: "2024-03-10",
    content: `
## The Digital Healthcare Revolution

The healthcare industry is undergoing a massive transformation. Telehealth, once considered a convenience, has become an essential component of modern healthcare delivery.

### What is Telehealth?

Telehealth encompasses a broad range of technologies and services to provide patient care and improve healthcare delivery remotely. This includes:

- **Video consultations** with doctors and specialists
- **Remote patient monitoring** using connected devices
- **Digital health apps** for symptom tracking
- **Electronic prescriptions** and pharmacy services

## Benefits of Virtual Care

### Accessibility

Telehealth breaks down geographical barriers. Patients in remote areas can now access specialists who were previously unavailable to them.

### Convenience

No more waiting rooms or travel time. Consult with your doctor from the comfort of your home, office, or anywhere with an internet connection.

### Cost-Effective

Virtual visits often cost less than in-person appointments, and you save on transportation and parking costs.

### Continuity of Care

Regular check-ins become easier to maintain, leading to better management of chronic conditions.

## Types of Virtual Care Services

### Synchronous Telehealth

Real-time interactions between patient and provider via video or phone calls. Ideal for:
- Follow-up appointments
- Mental health counseling
- Minor acute conditions
- Medication management

### Asynchronous Telehealth

Store-and-forward technology where patients share information (photos, documents) for later review. Useful for:
- Dermatology consultations
- Radiology second opinions
- Specialist referrals

### Remote Patient Monitoring

Connected devices that track health metrics in real-time:
- Blood pressure monitors
- Glucose meters
- Heart rate monitors
- Sleep trackers

## The Future is Hybrid

The most effective healthcare model combines the best of both worlds. Virtual care handles routine consultations and follow-ups, while in-person visits are reserved for physical examinations and procedures.

### Emerging Technologies

- **AI-powered diagnostics** for faster and more accurate assessments
- **Virtual reality** for physical therapy and rehabilitation
- **Wearable devices** providing continuous health monitoring
- **Blockchain** for secure health records

## Making the Most of Telehealth

### Prepare for Your Visit

1. Test your technology beforehand
2. Find a quiet, well-lit space
3. Have your medical history and medications list ready
4. Write down your questions and concerns

### Be Honest and Detailed

Since your provider can't examine you physically, clear communication is crucial. Describe your symptoms in detail and don't hesitate to share concerns.

---

*Experience the convenience of telehealth with our virtual care services. Book your teleconsultation today.*
    `,
  },
  {
    slug: "heart-health-basics",
    category: "Cardiology",
    readTime: "7 min read",
    title: "Heart Health Basics for Longevity",
    description:
      "Simple steps for a healthier, longer life. Understand the vital signs.",
    image:
      "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?q=80&w=1200&auto=format&fit=crop",
    author: {
      name: "Dr. Rahul Mehta",
      role: "Cardiologist",
    },
    publishedAt: "2024-03-05",
    content: `
## Your Heart: The Engine of Life

Your heart beats about 100,000 times per day, pumping blood through a network of vessels that would stretch over 60,000 miles if laid end to end. Taking care of this incredible organ is one of the most important things you can do for your longevity.

## Understanding Heart Disease

Heart disease remains the leading cause of death globally. But here's the good news: up to 80% of heart disease is preventable through lifestyle changes.

### Major Risk Factors

**Controllable factors:**
- High blood pressure
- High cholesterol
- Diabetes
- Obesity
- Smoking
- Physical inactivity
- Unhealthy diet
- Excessive alcohol consumption

**Uncontrollable factors:**
- Age
- Family history
- Gender
- Ethnicity

## Know Your Numbers

Regular monitoring of these key metrics can help you track your heart health:

### Blood Pressure

- **Normal**: Less than 120/80 mmHg
- **Elevated**: 120-129/less than 80 mmHg
- **High (Stage 1)**: 130-139/80-89 mmHg
- **High (Stage 2)**: 140+/90+ mmHg

### Cholesterol Levels

- **Total Cholesterol**: Less than 200 mg/dL
- **LDL ("bad" cholesterol)**: Less than 100 mg/dL
- **HDL ("good" cholesterol)**: 60 mg/dL or higher
- **Triglycerides**: Less than 150 mg/dL

### Blood Sugar

- **Fasting**: Less than 100 mg/dL
- **HbA1c**: Less than 5.7%

## Heart-Healthy Lifestyle

### Eat for Your Heart

The Mediterranean diet has been consistently shown to reduce heart disease risk:

- **Fruits and vegetables**: Aim for 5+ servings daily
- **Whole grains**: Replace refined grains with whole wheat, oats, and brown rice
- **Healthy fats**: Olive oil, nuts, and fatty fish
- **Lean proteins**: Fish, poultry, beans, and legumes
- **Limit**: Salt, added sugars, and saturated fats

### Move Your Body

Aim for at least:
- 150 minutes of moderate aerobic activity weekly, OR
- 75 minutes of vigorous activity weekly
- Muscle-strengthening activities 2+ days per week

**Easy ways to get started:**
- Take the stairs instead of the elevator
- Go for a 30-minute walk after dinner
- Try a dance class or swimming
- Do bodyweight exercises at home

### Manage Stress

Chronic stress can contribute to heart disease. Practice stress-reduction techniques:

- Deep breathing exercises
- Meditation and mindfulness
- Regular physical activity
- Adequate sleep (7-9 hours)
- Social connections

### Quit Smoking

Smoking dramatically increases heart disease risk. Within just one year of quitting:
- Your heart disease risk drops significantly
- Your lungs begin to heal
- Your circulation improves

## Warning Signs

Know the signs of a heart attack:

- **Chest discomfort**: Pressure, squeezing, or pain
- **Upper body pain**: Arms, back, neck, jaw, or stomach
- **Shortness of breath**
- **Cold sweat**
- **Nausea or lightheadedness**

Women may also experience:
- Unusual fatigue
- Sleep disturbances
- Indigestion

**If you experience these symptoms, call emergency services immediately.**

## Regular Check-ups

Prevention is key. Schedule regular check-ups with your healthcare provider for:

- Blood pressure screening
- Cholesterol testing
- Diabetes screening
- Weight and BMI assessment
- Discussion of family history and risk factors

---

*Concerned about your heart health? Our doctors can visit your home for a comprehensive cardiac assessment. Book a home visit today.*
    `,
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return BLOG_POSTS.map((post) => post.slug);
}
