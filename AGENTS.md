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
