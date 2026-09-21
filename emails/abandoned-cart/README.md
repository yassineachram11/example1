# Pilo Shop — Abandoned cart flow

Three sends. Each `preview-*.html` is the same email with sample data filled in,
just to look at in a browser.

| # | When | File | Job |
|---|---|---|---|
| 1 | 1 hour after abandonment | `abandoned-cart.html` | Remind. Two sentences, the cart, one button. No discount — most people were simply interrupted, and a coupon an hour in teaches people to abandon carts on purpose. |
| 2 | +22 hours | `abandoned-cart-detailed.html` | Persuade. Benefits, the two objections that stop a pillow sale, the 2-pack upsell. Still no discount. |
| 3 | +48 hours | `cart-expired.html` | Close. A real deadline, an open door, and the only place a sweetener belongs. |

Running only #1 is fine and still recovers most of what this flow will ever recover.
Add #2 and #3 when you want the rest.

Built for **Shopify → Settings → Notifications → Abandoned checkout**
(Liquid: `checkout.customer.first_name`, `checkout.line_items`, `url`, `unsubscribe_url`).
Shopify sends one abandoned checkout notification natively — for the full three-send
sequence you need Klaviyo or similar. SMS copy lives in `../../sms/abandoned-cart.md`.

## Before you send — replace these

| Placeholder | In | Replace with |
|---|---|---|
| `{{ SIGNER_NAME }}` | all | A real first name. Emails from a person outperform emails from a brand. |
| `{{ SHOP_ADDRESS }}` | all | Your physical address (legally required in most markets). |
| `{{ HOLD_DAYS }}` | email 3 | How long you actually held the cart, written out ("three"). |
| `{{ TRIAL_NIGHTS }}` | email 2 | Your trial length. No trial? Delete the block rather than promise one. |

On Klaviyo, swap: `first_name|default:"there"|title` for the name,
`{% for item in event.extra.line_items %}` for the loop, `event.extra.checkout_url`
for `url`, `{% unsubscribe %}` for the unsubscribe link.

## Subject lines

**Email 1** — *Your Pilo 1.0 is still in your cart* (preview: *Saved and still in stock.*)
Alternates: *You didn't finish your order* / *Still thinking it over?*
Plain beats clever. Naming the product usually earns the most per send, because the
people who open already know what they want.

**Email 2** — *Night one felt strange. Night four I stopped waking up.*
Lead with a real customer line here, not a made-up one.

**Email 3** — *We're clearing your cart tonight* (preview: *After tonight you'd be starting over.*)
Alternate without a deadline: *Last note about your cart*

## The one rule for email 3

**If it says the cart expires tonight, the cart has to expire tonight.** Stop sending,
let the recovery link lapse, and don't resurrect the same cart next week. A deadline you
don't keep is the fastest way to teach people that your deadlines are decoration — and
they'll wait for the discount every time after that.

If you aren't willing to enforce it, use the no-deadline subject line and cut the
"after tonight the link stops working" sentence. The email still works as a last note.

The sweetener in email 3 is commented out on purpose. Free shipping protects margin
better than 10% off on an $80 product. If you turn it on, honour it.

## Plain-text version (email 1)

> Hi {{ first_name }}, your cart is saved — and everything in it is still in stock.
>
> Finish my order: {{ url }}
>
> Sleep well,
> {{ SIGNER_NAME }} — Pilo Shop
> Just hit reply, a human reads it.
>
> Unsubscribe: {{ unsubscribe_url }}

## Housekeeping

- Suppress anyone who bought between the abandonment and the send, on every step.
- Cap the flow so a serial browser isn't getting all three every week.
- Exit the flow on purchase, obviously — check this before you turn it on, not after.
