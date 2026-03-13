import { z } from 'zod';

export const OnboardingSchema = z.object({
  user_type: z.string().min(1, { message: "Please select your user type." }),
  currency_code: z.string().min(1, { message: "Please select your currency." }),
  tax_year_start: z.string().min(1, { message: "Please select your tax year start date." }),
});

export const SignInSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export const SignUpSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});
