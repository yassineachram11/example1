# Pilo Shop — Abandoned cart SMS

Written for Klaviyo SMS (Django syntax, same as the Klaviyo email). Every message
below is **one segment** — plain GSM-7 characters, no emoji, no curly quotes, no em dashes.

## The message to send

Send it **30 minutes** after abandonment.

```django
Pilo: your cart is saved and everything in it is still in stock. Finish your order: {{ event.extra.checkout_url }}
```

110 characters rendered. No name, because at 30 minutes most abandoners never reached
the name field at checkout, and "Hi there, it's Pilo" reads worse than just saying the thing.

### If your carts do carry names

```django
Hi {{ first_name|default:"there"|title }}, it's Pilo. Your cart is saved and still in stock. Finish your order: {{ event.extra.checkout_url }}
```

107 characters rendered. Check your own data first: if fewer than ~70% of abandoned
carts have a first name, use the version above instead.

### Softer alternative

```django
Pilo: still thinking it over? Your cart is saved, no rush: {{ event.extra.checkout_url }}
```

85 characters. Lower pressure, and the one to pick if SMS is new for your list.

### Follow-up, 24 hours later (optional)

```django
Pilo: last call, we release your cart tonight. {{ event.extra.checkout_url }}
```

73 characters. Only send this if you actually release the cart. An empty deadline
is the fastest way to get unsubscribed from SMS.

Two SMS is the ceiling for an abandoned cart. Anything more and you are texting
someone who already decided no.

## Rules that matter

**Consent is separate from email.** An email subscriber has not consented to SMS.
Only people who opted into SMS specifically can receive this, or you are exposed
under TCPA in the US and PECR/GDPR in the EU. Klaviyo enforces this if your list is
clean — do not import phone numbers collected at checkout as SMS consent.

**Do not hardcode "Reply STOP to opt out."** Klaviyo appends opt-out language
automatically on the first message to a new subscriber and periodically after.
Typing it yourself burns characters and can double up.

**Quiet hours.** Set them in Klaviyo (Settings > SMS) and leave Smart Sending on.
Your store is in Lebanon but your customers are not — Klaviyo goes by each
recipient's local time, which is what you want. A 2am text loses the customer
and the number.

**No emoji, no em dashes, no smart quotes.** A single non-GSM character flips the whole
message to UCS-2 encoding and drops the limit from 160 characters to 70, so a
one-segment SMS silently becomes two and costs double. Paste from a plain editor,
not from a doc that autocorrects quotes.

**Links.** Leave `{{ event.extra.checkout_url }}` raw. Klaviyo shortens and tracks it
automatically (roughly 26 characters, which is what the counts above assume). Do not
run it through a third-party shortener — carriers filter those.

**Suppress buyers.** Same as the email: anyone who completed checkout between the
abandonment and the send should not get this.

## Setup in Klaviyo

1. Flows > the abandoned cart flow, triggered by **Checkout Started**.
2. Add an SMS message, 30 minute delay from trigger.
3. Filter the branch to **SMS subscribers only** so email-only profiles skip it.
4. Paste the message. Preview against a real profile *and* one with no first name.
5. Send yourself a test to a real handset. Check where the line breaks and that the
   short link resolves to a working checkout.

Event property names vary slightly with how your Shopify integration is configured.
Confirm `event.extra.checkout_url` against a live event in the flow preview before
you turn it on.
