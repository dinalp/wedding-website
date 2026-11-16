export async function sendCode(email: string, code: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RSVP_FROM_EMAIL;
  if (!key || !from) throw new Error("RSVP email unavailable");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST", cache: "no-store", signal: AbortSignal.timeout(8000),
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [email], subject: "Your wedding RSVP code",
      text: `Your Dinal & Shayani wedding RSVP code is ${code}. It expires in 10 minutes and can be used once. If you did not request this code, you can ignore this email.` }),
  });
  if (!response.ok) throw new Error("RSVP email unavailable");
}
