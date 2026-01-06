
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { LanguageCode } from '@/utils/landing/languageDetection';
import { submitLeadFunction } from '@/utils/landing/leadSubmission';
import { trackEvent } from '@/utils/landing/analytics';

// Schema Definition
const formSchema = z.object({
    fullName: z.string().min(2, "Name is too short"),
    whatsapp_sms: z.string().min(6, "Phone number is invalid"), // Renamed from phone
    comment: z.string().optional(),
    consent: z.boolean().refine(val => val === true, "You must agree to the terms"),
});

type FormValues = z.infer<typeof formSchema>;

export interface LeadFormProps {
    language: LanguageCode;
    translations: {
        title: string;
        fields: { fullName: string; contactField: string; contactFieldAlt?: string; comment: string };
        consent: string;
        submit: string;
        recaptcha: string;
        success: string;
        error: string;
        [key: string]: any;
    };
    propertyId?: string;
    source?: string;
    onSuccess: () => void;
    className?: string; // Add className support
}

const LeadForm: React.FC<LeadFormProps> = ({
    language,
    translations,
    propertyId,
    source = 'landing_form',
    onSuccess,
    className
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const { control, register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            consent: false,
        }
    });

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        setErrorMsg(null);

        trackEvent('lead_form_submit_attempt', { category: 'Conversion', language, propertyId });

        try {
            const success = await submitLeadFunction({
                fullName: data.fullName,
                phone: data.whatsapp_sms, // Mapped to phone
                countryCode: 'XX', // Handled by library
                comment: data.comment,
                consent: data.consent,
                language,
                propertyInterest: propertyId,
                source
            });

            if (success) {
                trackEvent('lead_form_submit', { category: 'Conversion', language, propertyId });
                onSuccess();
                reset();
            } else {
                throw new Error('Submission failed');
            }
        } catch (err) {
            setErrorMsg(translations.error);
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6 ${className || ''}`}>
            <input type="hidden" name="project_interest" value={propertyId || ''} />

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="fullName">{translations.fields?.fullName || "Full Name"}</Label>
                    <Input
                        id="fullName"
                        {...register('fullName')}
                        className={errors.fullName ? "border-red-500" : ""}
                    />
                    {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="whatsapp_sms">{translations.form?.contactField || translations.fields?.contactField || "WhatsApp / SMS number"}</Label>
                    <Controller
                        name="whatsapp_sms"
                        control={control}
                        render={({ field }) => (
                            <PhoneInput
                                international
                                defaultCountry="ES"
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="+34 600 123 456"
                                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.whatsapp_sms ? "border-red-500" : ""}`}
                            />
                        )}
                    />
                    {errors.whatsapp_sms && <p className="text-xs text-red-500">{errors.whatsapp_sms.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="comment">{translations.fields?.comment || "Comment (optional)"}</Label>
                    <Textarea
                        id="comment"
                        {...register('comment')}
                        rows={3}
                    />
                </div>

                <div className="flex items-start space-x-2 pt-2">
                    <Controller
                        name="consent"
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                id="consent"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                    <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="consent" className="text-xs font-normal text-muted-foreground leading-normal">
                            {translations.form?.consent || translations.consent || "I agree to receive relevant information."}
                        </Label>
                        {errors.consent && <p className="text-xs text-red-500">{errors.consent.message}</p>}
                    </div>
                </div>
            </div>

            {errorMsg && <p className="text-sm text-red-500 text-center">{errorMsg}</p>}

            <Button
                type="submit"
                className="w-full bg-[#1A2332] hover:bg-[#2C3E50] text-white"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Sending...' : translations.submit}
            </Button>

            <p className="text-[10px] text-gray-400 text-center leading-tight">
                {translations.recaptcha}
            </p>
        </form>
    );
};

export default LeadForm;
