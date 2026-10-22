<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Print/merch fulfillment goes to Printify; checkout line items carry catalogue ids in Stripe product metadata so the webhook can map purchases back without saved Stripe prices.
- Customer "design your own" merch is sent to Printify as an order line built from an existing shop product (blueprint/provider/variant) plus the chosen painting image URL, so no Printify product is created per order.
- Checkout assigns tax codes through the shared physical-product tax category helper to every inline Stripe product, so automatic tax never depends on an unset account default.
- Sitemap static URLs derive from required route-level staticData.sitemap decisions; dynamic artwork and published news URLs use paginated public reads, so new routes stay explicit and private pages never leak into discovery.
- The Blog page uses the existing published article catalogue and news-admin editor, retaining /news/$slug article URLs so existing links remain valid.
- Bespoke illustrated editorial articles may use unnested /blog/* leaf routes linked from Blog; keep catalogue posts and their existing /news/* URLs unchanged because the plain-text editor cannot preserve these illustrated layouts.
- Print orders map print_options labels (size) to fixed Printify catalogue blueprints in printify.server.ts and send the painting image URL, so no per-painting Printify product is needed.
- Store coupon eligibility and expiry in a shared browser-safe helper; revalidate server-side and discount only eligible catalogue-priced lines before Stripe checkout so mixed carts never discount excluded products.
