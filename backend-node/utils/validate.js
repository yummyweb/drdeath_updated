const { z } = require('zod');

// ── Reusable primitives ───────────────────────────────────────────────────────
const phone  = z.string().regex(/^[+\d\s\-().]{7,20}$/, 'Invalid phone number').optional();
const url    = z.string().url('Invalid URL').optional().or(z.literal(''));
const nonEmpty = (label) => z.string().trim().min(1, `${label} is required`);
const year   = z.number().int().min(0).max(60).optional();

// ── Auth ─────────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  full_name: nonEmpty('Full name'),
  email:     z.string().email('Invalid email'),
  password:  z.string().min(8, 'Password must be at least 8 characters'),
});

// ── Story ─────────────────────────────────────────────────────────────────────
const storySchema = z.object({
  title:         nonEmpty('Title').max(300),
  incident_date: z.string().optional(),
  hospital_name: z.string().max(200).optional(),
  location:      z.string().max(200).optional(),
  description:   nonEmpty('Description').max(50000),
  outcome:       z.string().max(10000).optional(),
});

// ── Advocate registration ─────────────────────────────────────────────────────
const advocateSchema = z.object({
  full_name:          nonEmpty('Full name').max(200),
  email:              z.string().email('Invalid email'),
  phone:              phone,
  bar_council_number: nonEmpty('Bar council number').max(100),
  bar_council_state:  z.string().max(100).optional(),
  specializations:    z.array(z.string()).min(1, 'Select at least one specialization').optional(),
  experience_years:   z.number().int().min(0).max(60).optional(),
  biography:          z.string().max(5000).optional(),
  city:               z.string().max(100).optional(),
  state:              z.string().max(100).optional(),
  website:            url,
  linkedin:           url,
});

// ── Doctor registration ───────────────────────────────────────────────────────
const doctorSchema = z.object({
  full_name:              nonEmpty('Full name').max(200),
  email:                  z.string().email('Invalid email'),
  phone:                  phone,
  qualification:          nonEmpty('Qualification').max(200),
  medical_council_reg:    nonEmpty('Medical council registration').max(100),
  specialization:         nonEmpty('Specialization').max(100),
  experience_years:       z.number().int().min(0).max(60).optional(),
  consent_not_reviewer:   z.boolean({ required_error: 'Consent is required' }),
  biography:              z.string().max(5000).optional(),
  city:                   z.string().max(100).optional(),
  state:                  z.string().max(100).optional(),
  website:                url,
  linkedin:               url,
});

// ── Journalist registration ───────────────────────────────────────────────────
const journalistSchema = z.object({
  full_name:    nonEmpty('Full name').max(200),
  email:        z.string().email('Invalid email'),
  phone:        phone,
  publication:  z.string().max(200).optional(),
  how_can_help: nonEmpty('Please describe how you can help').max(2000),
  biography:    z.string().max(5000).optional(),
  city:         z.string().max(100).optional(),
  state:        z.string().max(100).optional(),
  website:      url,
  linkedin:     url,
});

// ── Researcher registration ───────────────────────────────────────────────────
const researcherSchema = z.object({
  full_name:    nonEmpty('Full name').max(200),
  email:        z.string().email('Invalid email'),
  phone:        phone,
  institution:  z.string().max(200).optional(),
  how_can_help: nonEmpty('Please describe how you can help').max(2000),
  biography:    z.string().max(5000).optional(),
  city:         z.string().max(100).optional(),
  state:        z.string().max(100).optional(),
  website:      url,
  linkedin:     url,
  orcid:        z.string().max(50).optional(),
});

// ── Volunteer registration ────────────────────────────────────────────────────
const volunteerSchema = z.object({
  full_name:    nonEmpty('Full name').max(200),
  email:        z.string().email('Invalid email'),
  phone:        phone,
  city:         z.string().max(100).optional(),
  state:        z.string().max(100).optional(),
  motivation:   z.string().max(2000).optional(),
});

// ── Grant application ─────────────────────────────────────────────────────────
const grantSchema = z.object({
  full_name:      nonEmpty('Full name').max(200),
  email:          z.string().email('Invalid email'),
  phone:          phone,
  incident_date:  z.string().optional(),
  hospital_name:  z.string().max(200).optional(),
  description:    nonEmpty('Description').max(20000),
  amount_requested: z.number().positive().optional(),
});

// ── Contact ───────────────────────────────────────────────────────────────────
const contactSchema = z.object({
  name:    nonEmpty('Name').max(200),
  email:   z.string().email('Invalid email'),
  subject: z.string().max(300).optional(),
  message: nonEmpty('Message').max(5000),
});

// ── Event ─────────────────────────────────────────────────────────────────────
const eventSchema = z.object({
  title:       nonEmpty('Title').max(300),
  description: nonEmpty('Description').max(20000),
  event_type:  nonEmpty('Event type'),
  format:      nonEmpty('Format'),
  date:        z.string().min(1, 'Date is required'),
  organizer:   z.string().max(200).optional(),
  organizer_email: z.string().email().optional().or(z.literal('')),
  is_free:     z.boolean().optional(),
  fee:         z.number().min(0).optional(),
});

// ── Middleware factory ────────────────────────────────────────────────────────
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(422).json({ detail: 'Validation failed', errors });
    }
    req.body = result.data; // coerced + stripped unknown fields
    next();
  };
}

module.exports = {
  validate,
  schemas: {
    login: loginSchema,
    register: registerSchema,
    story: storySchema,
    advocate: advocateSchema,
    doctor: doctorSchema,
    journalist: journalistSchema,
    researcher: researcherSchema,
    volunteer: volunteerSchema,
    grant: grantSchema,
    contact: contactSchema,
    event: eventSchema,
  },
};
