"use client";

import { useState } from "react";
import { useModal } from "./ModalProvider";
import { DETAIL, STATES } from "@/lib/copy";
import { getDepartureById, inr } from "@/lib/departures";
import { fareFor, planSpan, plansFor, statesByFare, type Plan } from "@/lib/packages";
import NoFare from "./NoFare";

/* The plan cards on a departure page.
 *
 * Two cards, one per package, each showing what it covers and what it
 * costs. The fare is per state, so the section asks where somebody is
 * travelling from first and fills both cards in from that — the whole
 * point being that you compare the two real numbers for YOUR state,
 * not two ranges you then have to interpret.
 *
 * Before a state is picked, each card shows its own span rather than
 * nothing: a card with no price on it looks broken, and the span is
 * true.
 *
 * PROCEED opens the application with the departure and the plan
 * already chosen. It carries no price — the form asks the server what
 * is owed, and the apply route works it out again from the state and
 * plan that were actually submitted. */

/* Spelled out to four, which is as many plans as a page can usefully
   compare. Beyond that the digit is fine. */
const WAYS: Record<number, string> = { 1: "One", 2: "Two", 3: "Three", 4: "Four" };

export default function PlanCards({
  departureId,
  soldOut = false,
}: {
  departureId: string;
  soldOut?: boolean;
}) {
  const { openApply } = useModal();
  const [state, setState] = useState("");

  const plans = plansFor(departureId);
  const { priced, unpriced } = statesByFare(departureId, STATES);
  const priceNote = getDepartureById(departureId)?.priceNote;
  if (plans.length === 0) return null;

  return (
    <div className="s-plans">
      <div className="s-plans-head">
        <div>
          <p className="s-panel-h">{DETAIL.plansLabel}</p>
          <p className="s-panel-sub" style={{ marginBottom: 0 }}>
            {WAYS[plans.length] ?? plans.length} ways to do it. {DETAIL.plansSubTail}
          </p>
        </div>

        <div className="s-field s-plans-state">
          <label htmlFor="plan-state">{DETAIL.plansStateLabel}</label>
          <div className="s-selwrap">
            {/* Just the names, exactly as before — but ordered by fare
                rather than A–Z, cheapest at the top. The price stays
                off the option on purpose: it already appears on the
                card the moment a state is picked, and repeating it in
                a 36-item list made the list the loudest thing on the
                page. The order carries the meaning quietly.

                Unpriced states fall to the end, still alphabetical,
                because there is no price to rank them by. */}
            <select
              id="plan-state"
              className="s-select"
              value={state}
              onChange={(e) => setState(e.target.value)}
            >
              <option value="">{DETAIL.plansStatePh}</option>
              {[...priced.map((p) => p.state), ...unpriced].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="s-plan-grid">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            state={state}
            soldOut={soldOut}
            priceNote={priceNote}
            onProceed={() => openApply(departureId, "plan-card", plan.id)}
          />
        ))}
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  state,
  soldOut,
  priceNote,
  onProceed,
}: {
  plan: Plan;
  state: string;
  soldOut: boolean;
  priceNote?: string;
  onProceed: () => void;
}) {
  const fare = fareFor(plan, state);
  const span = planSpan(plan);
  /* A plan with no fares at all — priced later. Says so rather than
     rendering an empty figure. */
  const unpriced_plan = span === null;

  /* Three states, and they are genuinely different things:
     no state chosen yet (show the span), a state we price (show the
     fare), and a state we do not price yet (say so — never a guess). */
  const unpriced = unpriced_plan || (state !== "" && fare === null);

  return (
    <article className="s-plan">
      <div className="s-plan-head">
        <p className="s-plan-n">
          {plan.n} <span className="s-plan-dur">{plan.duration}</span>
        </p>
        {/* `download` rather than a plain link: opening a PDF in a new
            tab on a phone buries the page you were comparing on. */}
        {plan.brochure ? (
          <a className="s-plan-pdf" href={plan.brochure} download>
            <span aria-hidden="true">⬇</span> {DETAIL.plansBrochure}
          </a>
        ) : null}
      </div>
      <h3 className="s-plan-name">{plan.name}</h3>
      <p className="s-plan-blurb">{plan.blurb}</p>

      <ul className="s-list s-list-yes s-plan-list">
        {plan.includes.map((i) => (
          <li key={i}>
            <span aria-hidden="true">✓</span>
            <span>{i}</span>
          </li>
        ))}
      </ul>

      <div className="s-plan-price">
        {unpriced ? (
          <NoFare line={DETAIL.plansNoFare} />
        ) : (
          <>
            <p className="s-eyebrow s-eyebrow-grey">
              {fare === null ? DETAIL.plansFrom : state}
            </p>
            <p className="s-plan-figure">
              {fare === null && span
                ? `${inr(span.min)} – ${inr(span.max)}`
                : fare !== null
                  ? inr(fare)
                  : "—"}
              <span className="s-price-per">{DETAIL.plansPer}</span>
            </p>
            {fare === null ? <p className="s-hint">{DETAIL.plansPrompt}</p> : null}
            {/* Stamped, not listed: it qualifies the figure directly
                above it, and a stamp reads as an assertion where a
                grey hint reads as small print. */}
            {priceNote ? <p className="s-plan-stamp">{priceNote}</p> : null}
          </>
        )}
      </div>

      {soldOut ? null : (
        <button type="button" className="s-btn s-btn-forest s-plan-cta" onClick={onProceed}>
          {DETAIL.plansCta} <span className="s-arrow">→</span>
        </button>
      )}
    </article>
  );
}
