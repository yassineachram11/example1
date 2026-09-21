# Pilo Shop — Abandoned cart email

| File | What it is |
|---|---|
| `abandoned-cart.html` | **The one to send.** Short: two sentences, the cart, one button. |
| `abandoned-cart-detailed.html` | Longer version with benefits, objection handling and the 2-pack upsell. Keep it around for email 2 if you ever build a sequence. |
| `preview.html` / `preview-detailed.html` | Same emails with sample data, for looking at in a browser. |

Built for **Shopify → Settings → Notifications → Abandoned checkout**
(Liquid: `checkout.customer.first_name`, `checkout.line_items`, `url`, `unsubscribe_url`).

## Before you send — replace these two

| Placeholder | Replace with |
|---|---|
| `{{ SIGNER_NAME }}` | A real first name. Emails from a person outperform emails from a brand. |
| `{{ SHOP_ADDRESS }}` | Your physical address (legally required in most markets). |

The detailed version also has `{{ TRIAL_NIGHTS }}` — your trial length. If you don't offer a
trial, delete that block rather than promise one.

On Klaviyo instead? Swap: `person.first_name` for the name,
`{% for item in event.extra.line_items %}` for the loop, `event.extra.checkout_url` for `url`.

## Subject lines

1. **You left your neck hanging** — preview: *Your cart is saved and still in stock.*
2. **Your Pilo 1.0 is still in your cart** — preview: *Still in stock. Takes 40 seconds to finish.*

Curiosity (#1) usually wins opens; clarity (#2) usually wins revenue. Run both, keep the winner.

## Plain-text version

> Hi {{ first_name }}, you didn't quite finish your order. It's still saved, and still in stock.
>
> Finish my order: {{ url }}
>
> Sleep well,
> {{ SIGNER_NAME }} — Pilo Shop
> Just hit reply, a human reads it.
>
> Unsubscribe: {{ unsubscribe_url }}

## Timing

Send it **1 hour** after abandonment, with no discount — most people were simply
interrupted, and a coupon an hour in teaches people to abandon carts on purpose.
Suppress anyone who has since bought.
