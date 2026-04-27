class CouponGameElement extends HTMLElement {
  connectedCallback() {
    const campaignId = this.getAttribute('campaign-id') ?? 'default';
    const userId = this.getAttribute('user-id') ?? 'anonymous-demo-user';
    const source = this.getAttribute('source') ?? 'web-component';
    const locale = this.getAttribute('locale') ?? navigator.language;
    const params = new URLSearchParams({ campaignId, userId, source, locale, embedded: 'true' });

    this.innerHTML = `<iframe title="Coupon game" src="/?${params.toString()}"></iframe>`;
  }
}

customElements.define('coupon-game', CouponGameElement);

export {};
