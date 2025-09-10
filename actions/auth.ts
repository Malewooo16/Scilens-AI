"use server";

import { prisma } from '@/db/prisma';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import { customAlphabet } from 'nanoid';
import VerificationEmail from '@/emails/VerificationEmail';
import VerificationCompleteEmail from '@/emails/VerificationCompleteEmail';

const resend = new Resend(process.env.RESEND_API_KEY);
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);

export async function signup(formData: FormData) {
 
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password) {
    return { error: 'Name, email, and password are required' };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: 'User with this email already exists' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = nanoid();

  try {
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken,
      },
    });

    // Send verification email
    await resend.emails.send({
      from: 'SciLens AI <onboarding@jaadvocates.co.tz>',
      to: email,
      subject: 'Verify your email address',
      react: await VerificationEmail({ name, verificationUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/verify/${verificationToken}` }),
    });

    return { success: 'User registered successfully. Please check your email for verification.' };
  } catch (error) {
    console.error('Signup error:', error);
    return { error: 'Internal Server Error' };
  }
}

export async function verifyEmail(token: string) {

  if (!token) {
    return { error: 'Verification token is missing' };
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
      },
    });

    if (!user) {
      return { error: 'Invalid or expired verification token' };
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
       
      },
    });

    // Send verification complete email
    await resend.emails.send({
      from: 'SciLens AI <onboarding@jaadvocates.co.tz>',
      to: user.email as string,
      subject: 'Email Verification Complete',
      react: await VerificationCompleteEmail({ name: user.name || 'User' }),
    });

    return { success: 'Email verified successfully. You are now logged in.' };
  } catch (error) {
    console.error('Email verification error:', error);
    return { error: 'Internal Server Error' };
  }
}
