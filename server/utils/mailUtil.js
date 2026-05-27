import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email, username){
    await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Welcome to Whisper!",
        html: `
            <h1>Welcome to Whisper, ${username}!</h1>
            <p>Your account has been created successfully.</p>
            <p>You can now log in and access your secret messages.</p>
        `
    });
}