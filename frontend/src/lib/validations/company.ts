import * as z from "zod";

export const companySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  industry: z.string().optional(),
  sector: z.string().optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  phone: z.string().optional(),
  email: z.string().email("Must be a valid email").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipcode: z.string().optional(),
  size: z.string().optional(),
  revenue: z.string().optional(),
  description: z.string().optional(),
  logo: z.string().url("Must be a valid image URL").optional().or(z.literal("")),
  linkedinUrl: z.string().url("Must be a valid LinkedIn URL").optional().or(z.literal("")),
  taxIdentifier: z.string().optional(),
});

export type CompanyFormValues = z.infer<typeof companySchema>;
