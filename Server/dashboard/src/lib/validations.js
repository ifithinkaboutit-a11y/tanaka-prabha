import { z } from "zod";

// Beneficiary (User/Farmer) schema
export const BeneficiarySchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    mobile_number: z.string().min(10, "Enter a valid 10-digit mobile number").max(15),
    age: z.coerce.number().min(1).max(120).optional().or(z.literal("")),
    gender: z.enum(["male", "female", "other"]).optional(),
    village: z.string().optional(),
    gram_panchayat: z.string().optional(),
    nyay_panchayat: z.string().optional(),
    post_office: z.string().optional(),
    tehsil: z.string().optional(),
    block: z.string().optional(),
    district: z.string().optional(),
    pin_code: z.string().optional(),
    state: z.string().optional(),
    fathers_name: z.string().optional(),
    mothers_name: z.string().optional(),
    educational_qualification: z.string().optional(),
    aadhaar_number: z.string().optional(),
});

// Professional schema
export const ProfessionalSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    role: z.string().min(2, "Role is required"),
    department: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    phone_number: z.string().optional(),
    district: z.string().optional(),
    service_area: z.string().optional(),
    specializations: z.string().optional(),
    image_url: z.string().url().optional().or(z.literal("")),
    is_available: z.boolean().default(true),
});

// Scheme schema
export const SchemeSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    title_hi: z.string().optional(),
    description: z.string().min(10, "Description must be at least 10 characters"),
    description_hi: z.string().optional(),
    overview: z.string().optional(),
    overview_hi: z.string().optional(),
    process: z.string().optional(),
    eligibility: z.string().optional(),
    key_objectives: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    image_url: z.string().optional(),
    hero_image_url: z.string().optional(),
    apply_url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
    support_contact: z.string().optional(),
    tags: z.string().optional(),
    is_active: z.boolean().default(true),
    is_featured: z.boolean().default(false),
});

// Banner schema
export const BannerSchema = z.object({
    title: z.string().min(2, "Title is required"),
    title_hi: z.string().optional(),
    subtitle: z.string().optional(),
    subtitle_hi: z.string().optional(),
    image_url: z.string().min(1, "Image is required"),
    redirect_url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
    sort_order: z.coerce.number().default(0),
    is_active: z.boolean().default(true),
});
