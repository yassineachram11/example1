# Pilo Shop — Abandoned cart email

`01-abandoned-cart.html` is the main email, written for **Shopify → Settings → Notifications → Abandoned checkout**
(Liquid variables: `checkout.customer.first_name`, `checkout.line_items`, `url`, `unsubscribe_url`).

`preview.html` is the same email with sample data filled in, just to look at in a browser.

## Before you send — replace these

| Placeholder | Replace with |
|---|---|
| `{{ TRIAL_NIGHTS }}` | Your actual trial length (e.g. `30`). If you don't offer a trial, delete that whole block — don't promise it. |
| `{{ SIGNER_NAME }}` | A real first name. Emails from a person outperform emails from a brand. |
| `{{ SHOP_ADDRESS }}` | Your physical address (legally required in most markets). |

If you're on Klaviyo instead of Shopify, swap the variables:

| Shopify | Klaviyo |
|---|---|
| `{{ checkout.customer.first_name }}` | `{{ person.first_name\|default:"there" }}` |
| `{{ checkout.line_items }}` loop | `{% for item in event.extra.line_items %}` |
| `{{ url }}` | `{{ event.extra.checkout_url }}` |

## Subject lines

Pick one, then A/B it against #2.

1. **You left your neck hanging** — preview: *We're holding your cart — plus the question everyone asks before buying.*
2. **Your Pilo 1.0 is still in your cart** — preview: *Still in stock. Takes 40 seconds to finish.*
3. **One more night on the old pillow?** — preview: *Or don't. Your cart is saved either way.*

Curiosity (#1) usually wins on opens; clarity (#2) usually wins on revenue per recipient. Test, don't guess.

## Plain-text version

> Hi {{ first_name }},
>
> You made it to checkout and then life happened. No problem — your cart is saved and
> everything in it is still in stock.
>
> Finish your order: {{ url }}
>
> What changes after night three:
> - Your head is cradled instead of propped — no sliding off the edge at 3am.
> - Your neck stays in line with your spine, so it rests instead of bracing all night.
> - You wake up without the morning ache, and without a stack of three pillows.
>
> "What if it's not right for me?" Then send it back. Sleep on it for {{ TRIAL_NIGHTS }} nights —
> if your mornings aren't better, email us and we'll refund you.
>
> Sharing a bed? The 2-pack is $150 instead of $160. Swap it at checkout: {{ url }}
>
> Sleep well,
> {{ SIGNER_NAME }} — Pilo Shop
> Just hit reply, a human reads it.
>
> Unsubscribe: {{ unsubscribe_url }}

## The sequence (one email leaves money on the table)

Most abandoned-cart revenue comes from emails 1 and 2. Three is the sweet spot.

**Email 1 — 1 hour after abandonment.** The email in this folder. No discount.
Most people just got interrupted; a discount here pays people to abandon carts.

**Email 2 — 22 hours later.** Same cart, different angle: proof instead of features.
Subject: *"Night one felt weird. Night four I stopped waking up."*
Lead with one real customer quote, then the cart, then the CTA. Still no discount.

**Email 3 — 48 hours after email 2.** Last call, and the only place a sweetener belongs.
Subject: *"Closing your cart tomorrow"*
Either 10% off with a real 24-hour expiry, or — better for margin on an $80 product —
free shipping. Say plainly that the cart expires, and actually expire it.

Suppress anyone who bought in between, and cap the flow so a serial browser isn't
getting this every week.
