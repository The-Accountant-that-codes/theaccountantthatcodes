import { NextResponse } from "next/server";

// Server-side proxy to Kit so the API key never reaches the browser.
// Kit V4 docs: POST /v4/subscribers with X-Kit-Api-Key header.
const KIT_API_URL = "https://api.kit.com/v4/subscribers";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: { email?: string; website?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: "error" }, { status: 400 });
  }

  // Honeypot filled -> almost certainly a bot. Return a fake success so
  // the bot moves on, and never call Kit.
  if (body.website) {
    return NextResponse.json({ status: "success" });
  }

  const email = (body.email ?? "").trim();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ status: "error" }, { status: 400 });
  }

  const apiKey = process.env.KIT_API_KEY;
  if (!apiKey) {
    console.error("KIT_API_KEY is not set");
    return NextResponse.json({ status: "error" }, { status: 500 });
  }

  try {
    const res = await fetch(KIT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Kit-Api-Key": apiKey,
      },
      body: JSON.stringify({ email_address: email }),
    });

    if (res.ok) {
      // Bare API-created subscribers get no emails from Kit. Routing
      // them through a form additionally triggers whatever that form is
      // configured to send (welcome automation / confirmation email).
      // Optional: only runs when KIT_FORM_ID is set.
      const formId = process.env.KIT_FORM_ID;
      if (formId && res.status === 201) {
        const formRes = await fetch(
          `https://api.kit.com/v4/forms/${formId}/subscribers`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Kit-Api-Key": apiKey,
            },
            body: JSON.stringify({ email_address: email }),
          }
        );
        if (!formRes.ok) {
          // Subscriber exists either way; a form failure shouldn't
          // surface as a signup error to the visitor.
          console.error(
            `Kit form add failed ${formRes.status}: ${(await formRes.text()).slice(0, 300)}`
          );
        }
      }
      // Kit returns 201 for a new subscriber and 200 when the email
      // already exists, so a 200 means "already subscribed".
      return NextResponse.json({
        status: res.status === 200 ? "duplicate" : "success",
      });
    }

    const detail = await res.text();
    // Some duplicate cases surface as a 422 validation error instead.
    if (res.status === 422 && /taken|exists|already/i.test(detail)) {
      return NextResponse.json({ status: "duplicate" });
    }
    console.error(`Kit API error ${res.status}: ${detail.slice(0, 500)}`);
    return NextResponse.json({ status: "error" }, { status: 502 });
  } catch (err) {
    console.error("Kit API request failed:", err);
    return NextResponse.json({ status: "error" }, { status: 502 });
  }
}
