# Store policies

Two policies that do not exist on the store yet, plus fixes for three broken placeholders
in the Terms of Service.

Checked on the live shop: `shopPolicies` returns only **Contact**, **Privacy policy** and
**Terms of service**. There is no refund policy and no shipping policy, so the links
Shopify puts in the checkout footer lead nowhere.

| File | Goes to |
|---|---|
| `refund-policy.html` | Settings → Policies → **Refund policy** |
| `shipping-policy.html` | Settings → Policies → **Shipping policy** |

Both are HTML because that is what Shopify stores. In the policy editor, switch to the
HTML view before pasting, or the tags will show up as text.

## Decisions made for you

These are the merchant-specific choices that had to be settled to write a usable policy.
Each one is a guess at what you want — change any that are wrong before publishing.

| Decision | Chosen | Where |
|---|---|---|
| Return window | **14 days from delivery** | Refund |
| Return condition | Unopened, unused, original sealed packaging | Refund — matches your FAQ wording exactly |
| Who pays return delivery | Customer for change of mind, Pilo for faulty or wrong | Refund |
| Refund method | Cash or bank transfer, agreed case by case | Refund — you take cash, so there is no card to refund to |
| Refund timing | Within 7 business days of the return arriving | Refund |
| Window to report damage | 48 hours from delivery, with photos | Refund |
| Dispatch time | Within one business day | Shipping |
| Delivery estimate | **1–5 working days** | Shipping — matches the site today |

**On that last one.** Your product page, FAQ and specs table all say 1–5 days, so the
policy says 1–5 days too; a policy that contradicts the storefront is worse than a slow
one. But Wakilni quote 1–2 working days for Zone A (Beirut, Jnah to Dbayeh, up to Baabda)
and 2–3 for the rest of Lebanon. If you go with them, 1–3 is both true and better, and it
is worth changing everywhere at once. Say the word and I will do that pass.

## Tone

Written plainly rather than as legal boilerplate, because the sealed-packaging rule is the
part customers are most likely to be annoyed by and the only thing that defuses it is
explaining *why*. The refund policy spends a short paragraph on that: a pillow sits against
your face all night, and we will not resell an opened one to somebody else. That reads as a
standard rather than an excuse.

It also says plainly that you would rather they asked before ordering than returned after,
which is both true and cheaper for you than a refused delivery.

## Terms of Service — three broken placeholders

Your published Terms of Service contains unfilled template markers. Find and replace:

| Find | Replace with |
|---|---|
| `our Privacy Policy [LINK]` | `our <a href="/policies/privacy-policy">Privacy Policy</a>` |
| `our Refund Policy [LINK]` | `our <a href="/policies/refund-policy">Refund Policy</a>` |
| `viewed here [LINK]` | `viewed <a href="/policies/privacy-policy">here</a>` |
| `review our privacy policy [LINK]` | `review our <a href="/policies/privacy-policy">privacy policy</a>` |

The refund link only works once the refund policy above is published, so publish that
first.

Also in **Settings → Policies → Contact information**: the line reads `Phone number:` with
nothing after it. Either fill it in or delete the line — an empty field looks like a site
that was never finished.

## Not published

I drafted these; I have not put them on the store. They are legal text about your money and
your customers' rights, and you should read them before they go live.

One thing I cannot answer: whether "unopened and sealed only" survives Lebanese consumer
protection law. Statutory return rights can override what a merchant writes, and this is a
country-specific question I have no reliable source for. The closing line of the refund
policy says nothing in it limits your rights under Lebanese consumer law, which is the
honest hedge, but it is not a substitute for asking someone local.

Tell me to publish and I will push both through the Admin API.
