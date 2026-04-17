import { useMemo, useState } from 'react';
import './Pricing.css';

type Plan = {
  name: string;
  subtitle: string;
  yearlyPrice: number;
  monthlyPrice: number;
  bullets: string[];
  promo: string;
};

const plans: Plan[] = [
  {
    name: 'Silver Menu',
    subtitle: 'Ideal for restaurants with 30 tables',
    yearlyPrice: 44,
    monthlyPrice: 55,
    bullets: ['7 to 12 Tablets', '1 to 30 QR Codes', 'Online Ordering'],
    promo: 'Save 20% per month with yearly plan',
  },
  {
    name: 'Gold Menu',
    subtitle: 'Ideal for restaurants with 100 tables',
    yearlyPrice: 52,
    monthlyPrice: 65,
    bullets: ['13 to 29 Tablets', '1 to 100 QR Codes', 'Online Ordering'],
    promo: 'Save 20% per month with yearly plan',
  },
  {
    name: 'Platinum Menu',
    subtitle: 'Ideal for restaurants / hotels with 200 tables / rooms',
    yearlyPrice: 79,
    monthlyPrice: 99,
    bullets: ['30 to 60 Tablets', '1 to 200 QR Codes', 'Online Ordering'],
    promo: 'Save 20% per month with yearly plan',
  },
  {
    name: 'Diamond Menu',
    subtitle: 'Ideal for restaurants / hotels with 500 tables / rooms',
    yearlyPrice: 99,
    monthlyPrice: 124,
    bullets: ['Up to 90 Tablets', '1 to 500 QR Codes', 'Online Ordering'],
    promo: 'Save 20% per month with yearly plan',
  },
  {
    name: 'Emerald Menu',
    subtitle: 'Ideal for restaurants / hotels with 800 tables / rooms',
    yearlyPrice: 149,
    monthlyPrice: 186,
    bullets: ['Up to 120 Tablets', '1 to 800 QR Codes', 'Online Ordering'],
    promo: 'Save 20% per month with yearly plan',
  },
  {
    name: 'Managed Service',
    subtitle: 'Ideal for restaurants / hotels with less staffing',
    yearlyPrice: 99,
    monthlyPrice: 124,
    bullets: ['Menu Optimization', 'Run Promotions', 'Keep Menu Updated'],
    promo: 'Save 20% per month with yearly plan',
  },
  {
    name: 'Setup',
    subtitle: 'One Time Setup Fee for Menu Design',
    yearlyPrice: 99,
    monthlyPrice: 124,
    bullets: ['Currently FREE with ALL Plans for limited time only!'],
    promo: 'Save 20% per month with yearly plan',
  },
];

const Pricing = () => {
  const [billingMode, setBillingMode] = useState<'monthly' | 'yearly'>('yearly');

  const activePlans = useMemo(
    () =>
      plans.map((plan) => ({
        ...plan,
        activePrice: billingMode === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice,
      })),
    [billingMode],
  );

  return (
    <div className="pricing-page">
      <div className="pricing-container">
        <div className="billing-toggle-wrap">
          <div className="save-label">
            Save 20% <span className="save-box">%</span>
          </div>
          <div className="billing-toggle">
            <button
              type="button"
              className={billingMode === 'monthly' ? 'toggle-btn active' : 'toggle-btn'}
              onClick={() => setBillingMode('monthly')}
            >
              Pay Monthly
            </button>
            <button
              type="button"
              className={billingMode === 'yearly' ? 'toggle-btn active' : 'toggle-btn'}
              onClick={() => setBillingMode('yearly')}
            >
              Pay Yearly
            </button>
          </div>
        </div>

        <section className="pricing-grid">
          {activePlans.map((plan) => (
            <article key={plan.name} className="pricing-card">
              <h3>{plan.name}</h3>
              <p className="card-subtitle">{plan.subtitle}</p>

              <div className="price-row">
                <span className="currency">$</span>
                <span className="price-value">{plan.activePrice}</span>
              </div>

              <p className="per-month">/ per month</p>
              <p className="plan-promo">{plan.promo}</p>

              <div className="plan-divider" />

              <div className="plan-features">
                {plan.bullets.map((bullet) => (
                  <p key={bullet}>{bullet}</p>
                ))}
              </div>

              <button type="button" className="trial-btn">
                Start Trial
              </button>

              <p className="trial-note">
                15 Days Trial
                <br />
                No Credit Card Needed
              </p>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
};

export default Pricing;
