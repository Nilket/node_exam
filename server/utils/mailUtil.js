import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email, username){
    await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Welcome to Icarus!",
        html: `
            <h1>Welcome to Icarus, ${username}!</h1>
            <p>Your account has been created successfully.</p>
            <p>You can now log in and access the dashboard of the newest information in cyber security.</p>
        `
    });
}